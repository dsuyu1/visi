// VISI support intake.
//
// Receives the /support form from visiutrgv.org, checks it, verifies the
// Turnstile token, and forwards a clean JSON payload to a Jira automation
// "Incoming webhook" rule. The rule creates the customer and the request in
// Jira Service Management, so this Worker never holds Jira credentials and
// never uses an agent seat.

// Request types the form may send. Anything else is rejected.
// `extras` lists the extra fields each type keeps; all other fields are dropped.
export const REQUEST_TYPES = {
  general: { label: "General question", extras: [] },
  membership: { label: "Join VISI", extras: ["discord", "school"] },
  partnership: { label: "Partnership or sponsorship", extras: ["organization"], required: ["organization"] },
  research: { label: "Research collaboration", extras: ["organization"], required: ["organization"] },
  clinic: {
    label: "Security clinic request",
    extras: ["organization", "domains", "email_handler", "need"],
    required: ["organization", "domains"],
  },
  event: { label: "Event or speaker request", extras: ["organization", "event_date"] },
  range: { label: "Range or account help", extras: ["username"] },
  security: { label: "Security report", extras: ["affected"], required: ["affected"] },
  other: { label: "Other", extras: [] },
};

// Human labels for extra fields, used when building the ticket description.
const FIELD_LABELS = {
  discord: "Discord username",
  school: "School",
  organization: "Organization",
  domains: "Domains",
  email_handler: "Who handles their email and website",
  need: "Help needed with",
  event_date: "Event date",
  username: "VISI username",
  affected: "Affected site or system",
};

// Fixed choices for select fields. Free text is not accepted for these.
const CHOICES = {
  email_handler: ["Myself", "An IT person", "A vendor", "Not sure"],
  need: ["Email security or spoofing", "General security check", "Something else"],
};

const MAX = {
  name: 100,
  email: 254,
  subject: 150,
  message: 4000,
  extra: 300,
  bodyBytes: 32 * 1024,
};

// Error codes the page knows how to explain. Keep in sync with support.js.
const ERRORS = {
  bad_origin: 403,
  too_large: 413,
  rate_limited: 429,
  invalid: 400,
  verify_failed: 400,
  upstream: 502,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origins = allowedOrigins(env);
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, origins) });
    }
    if (url.pathname !== "/submit") {
      return new Response("Not found", { status: 404 });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
    }

    const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
    const respond = (code, extra = {}) => reply({ code, extra, wantsJson, origin, origins });

    // Browsers send Origin on every cross-origin POST. No Origin, or the wrong
    // one, means this did not come from our page.
    if (!origin || !origins.includes(origin)) return respond("bad_origin");

    const length = Number(request.headers.get("Content-Length") || "0");
    if (length > MAX.bodyBytes) return respond("too_large");

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (env.SUPPORT_LIMITER) {
      const { success } = await env.SUPPORT_LIMITER.limit({ key: ip });
      if (!success) return respond("rate_limited");
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return respond("invalid", { field: "form" });
    }

    // Honeypot. Real people never see this field. Pretend it worked so bots
    // learn nothing, and drop the submission.
    if (clean(form.get("website"))) return respond("ok", { dropped: true });

    const parsed = validate(form);
    if (parsed.error) return respond("invalid", { field: parsed.error });

    // Turnstile last, so a typo in the form does not burn the one-time token.
    const verified = await verifyTurnstile(form.get("cf-turnstile-response"), ip, env, origins);
    if (!verified) return respond("verify_failed");

    const payload = buildPayload(parsed.value);
    try {
      const res = await fetch(env.JIRA_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Automation-Webhook-Token": env.JIRA_WEBHOOK_SECRET,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.log(JSON.stringify({ event: "jira_webhook_failed", status: res.status, type: payload.type }));
        return respond("upstream");
      }
    } catch {
      console.log(JSON.stringify({ event: "jira_webhook_unreachable", type: payload.type }));
      return respond("upstream");
    }

    // Log the type only. Never names, emails, or message text.
    console.log(JSON.stringify({ event: "submitted", type: payload.type }));
    return respond("ok", { type: payload.type });
  },
};

export function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "https://visiutrgv.org")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeaders(origin, origins) {
  const headers = { Vary: "Origin" };
  if (origin && origins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Accept";
    headers["Access-Control-Max-Age"] = "600";
  }
  return headers;
}

// One reply function for both paths:
// - fetch from support.js asks for JSON and gets {ok, code, ...}
// - a plain form post (no JS) gets a 303 redirect back to the site
function reply({ code, extra, wantsJson, origin, origins }) {
  const ok = code === "ok";
  const status = ok ? 200 : ERRORS[code];
  const site = origins[0];

  if (wantsJson) {
    const body = { ok, code };
    if (extra.field) body.field = extra.field;
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin, origins) },
    });
  }

  const target = ok
    ? `${site}/support/sent/${extra.type ? `?type=${encodeURIComponent(extra.type)}` : ""}`
    : `${site}/support/?error=${encodeURIComponent(code)}#support-form`;
  return new Response(null, { status: 303, headers: { Location: target } });
}

// Trim, drop control characters except newlines and tabs, normalize newlines.
export function clean(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

const oneLine = (s) => s.replace(/\s*\n\s*/g, " ");

// Deliberately simple. JSM itself will reject an address it can't use.
const EMAIL_RE = /^[^\s@<>()[\]{},;:"]+@[^\s@<>()[\]{},;:"]+\.[A-Za-z]{2,}$/;

export function validate(form) {
  const type = clean(form.get("type"));
  const def = REQUEST_TYPES[type];
  if (!def) return { error: "type" };

  const name = oneLine(clean(form.get("name")));
  const email = clean(form.get("email")).toLowerCase();
  const subject = oneLine(clean(form.get("subject")));
  const message = clean(form.get("message"));

  if (!name || name.length > MAX.name) return { error: "name" };
  if (!email || email.length > MAX.email || !EMAIL_RE.test(email)) return { error: "email" };
  if (!subject || subject.length > MAX.subject) return { error: "subject" };
  if (!message || message.length > MAX.message) return { error: "message" };

  const extras = {};
  for (const field of def.extras) {
    const value = oneLine(clean(form.get(field)));
    if (!value) continue;
    if (value.length > MAX.extra) return { error: field };
    if (CHOICES[field] && !CHOICES[field].includes(value)) return { error: field };
    if (field === "event_date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { error: field };
    extras[field] = value;
  }
  for (const field of def.required || []) {
    if (!extras[field]) return { error: field };
  }

  return { value: { type, name, email, subject, message, extras } };
}

export async function verifyTurnstile(token, ip, env, origins) {
  token = typeof token === "string" ? token : "";
  if (!token || token.length > 2048 || !env.TURNSTILE_SECRET) return false;

  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET);
  body.append("response", token);
  if (ip !== "unknown") body.append("remoteip", ip);

  let result;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    result = await res.json();
  } catch {
    return false;
  }
  if (!result || result.success !== true) return false;

  // A valid token minted for some other site or form is still not ours.
  const hostnames = origins.map((o) => new URL(o).hostname);
  if (!hostnames.includes(result.hostname)) return false;
  const action = env.TURNSTILE_ACTION || "support";
  if (result.action !== action) return false;
  return true;
}

// Stop text from the public being read as Jira smart values or wiki markup.
export function neutralize(text) {
  return text.replace(/\{\{/g, "{ {").replace(/\}\}/g, "} }").replace(/\{noformat\}/gi, "(noformat)");
}

// Every value from the form is neutralized before it goes into the payload.
// The {noformat} wrapper is added afterwards, so ours survives and theirs can't.
export function buildPayload({ type, name, email, subject, message, extras }) {
  const def = REQUEST_TYPES[type];
  const safeExtras = {};
  for (const [field, value] of Object.entries(extras)) safeExtras[field] = neutralize(value);

  const lines = [
    `Submitted through visiutrgv.org/support`,
    ``,
    `Name: ${neutralize(name)}`,
    `Email: ${email}`,
  ];
  for (const [field, value] of Object.entries(safeExtras)) {
    lines.push(`${FIELD_LABELS[field]}: ${value}`);
  }
  lines.push(``, `Message:`, `{noformat}`, neutralize(message), `{noformat}`);

  return {
    type,
    typeLabel: def.label,
    name: neutralize(name),
    email,
    summary: `[${def.label}] ${neutralize(subject)}`,
    description: lines.join("\n"),
    extras: safeExtras,
    submittedAt: new Date().toISOString(),
  };
}
