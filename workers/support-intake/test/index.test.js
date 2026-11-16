import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import worker, { validate, neutralize, buildPayload } from "../src/index.js";

const ORIGIN = "https://visiutrgv.org";
const env = {
  ALLOWED_ORIGINS: "https://visiutrgv.org,https://www.visiutrgv.org",
  TURNSTILE_ACTION: "support",
  TURNSTILE_SECRET: "secret",
  JIRA_WEBHOOK_URL: "https://jira.example/webhook",
  JIRA_WEBHOOK_SECRET: "hook-secret",
};

// Fake upstreams: Turnstile siteverify and the Jira webhook.
let calls;
let turnstileResult;
let jiraStatus;
beforeEach(() => {
  calls = [];
  turnstileResult = { success: true, hostname: "visiutrgv.org", action: "support" };
  jiraStatus = 200;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("siteverify")) return Response.json(turnstileResult);
    return new Response("", { status: jiraStatus });
  };
});

function formOf(fields) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

const base = {
  type: "general",
  name: "Ana Garza",
  email: "Ana@Example.com",
  subject: "Question about meetings",
  message: "When do you meet?",
  "cf-turnstile-response": "token",
};

function post(fields, { origin = ORIGIN, json = true, path = "/submit" } = {}) {
  const headers = { "CF-Connecting-IP": "203.0.113.5" };
  if (origin) headers.Origin = origin;
  if (json) headers.Accept = "application/json";
  return worker.fetch(
    new Request(`https://intake.visiutrgv.org${path}`, { method: "POST", headers, body: formOf(fields) }),
    env,
  );
}

const jiraCalls = () => calls.filter((c) => !c.url.includes("siteverify"));

test("valid submission is forwarded to Jira with the webhook secret", async () => {
  const res = await post(base);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, code: "ok" });
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), ORIGIN);

  const [jira] = jiraCalls();
  assert.equal(jira.url, env.JIRA_WEBHOOK_URL);
  assert.equal(jira.init.headers["X-Automation-Webhook-Token"], "hook-secret");
  const body = JSON.parse(jira.init.body);
  assert.equal(body.type, "general");
  assert.equal(body.email, "ana@example.com");
  assert.equal(body.summary, "[General question] Question about meetings");
  assert.match(body.description, /\{noformat\}\nWhen do you meet\?\n\{noformat\}/);
});

test("wrong or missing Origin is refused before anything else runs", async () => {
  for (const origin of ["https://evil.example", null]) {
    const res = await post(base, { origin });
    assert.equal(res.status, 403);
  }
  assert.equal(calls.length, 0);
});

test("honeypot submissions look successful but are dropped", async () => {
  const res = await post({ ...base, website: "http://spam.example" });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 0);
});

test("failed Turnstile check is rejected and nothing reaches Jira", async () => {
  turnstileResult = { success: false };
  let res = await post(base);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).code, "verify_failed");

  turnstileResult = { success: true, hostname: "other-site.example", action: "support" };
  res = await post(base);
  assert.equal(res.status, 400);

  turnstileResult = { success: true, hostname: "visiutrgv.org", action: "login" };
  res = await post(base);
  assert.equal(res.status, 400);

  assert.equal(jiraCalls().length, 0);
});

test("validation errors come back before Turnstile is spent", async () => {
  const res = await post({ ...base, email: "not-an-email" });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { ok: false, code: "invalid", field: "email" });
  assert.equal(calls.length, 0);
});

test("type-specific required fields are enforced", async () => {
  const res = await post({ ...base, type: "clinic", organization: "Taqueria" });
  assert.deepEqual(await res.json(), { ok: false, code: "invalid", field: "domains" });
});

test("unknown types and out-of-list choices are rejected", async () => {
  assert.equal(validate(formOf({ ...base, type: "access_request" })).error, "type");
  const bad = formOf({ ...base, type: "clinic", organization: "X", domains: "x.com", need: "Hack my ex" });
  assert.equal(validate(bad).error, "need");
});

test("fields that don't belong to the chosen type are dropped", async () => {
  const parsed = validate(formOf({ ...base, type: "general", organization: "Sneaky Corp", domains: "a.com" }));
  assert.deepEqual(parsed.value.extras, {});
});

test("smart values and noformat breakouts are neutralized", () => {
  assert.equal(neutralize("{{issue.reporter.emailAddress}}"), "{ {issue.reporter.emailAddress} }");
  const payload = buildPayload({
    type: "general",
    name: "{{now}}",
    email: "a@b.co",
    subject: "x",
    message: "end{noformat}*bold*",
    extras: {},
  });
  assert.equal(payload.name, "{ {now} }");
  // Only our own two wrapper tags remain.
  assert.equal(payload.description.match(/\{noformat\}/g).length, 2);
});

test("Other is accepted and keeps no extra fields", () => {
  const parsed = validate(formOf({ ...base, type: "other", organization: "X" }));
  assert.equal(parsed.value.type, "other");
  assert.deepEqual(parsed.value.extras, {});
  assert.equal(buildPayload(parsed.value).summary, "[Other] Question about meetings");
});

test("Jira failure returns 502", async () => {
  jiraStatus = 500;
  const res = await post(base);
  assert.equal(res.status, 502);
});

test("no-JS form posts get redirected back to the site", async () => {
  let res = await post({ ...base, type: "membership" }, { json: false });
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("Location"), "https://visiutrgv.org/support/sent/?type=membership");

  turnstileResult = { success: false };
  res = await post(base, { json: false });
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("Location"), "https://visiutrgv.org/support/?error=verify_failed#support-form");
});

test("rate limiter blocks when the binding says so", async () => {
  const limited = { ...env, SUPPORT_LIMITER: { limit: async () => ({ success: false }) } };
  const res = await worker.fetch(
    new Request("https://intake.visiutrgv.org/submit", {
      method: "POST",
      headers: { Origin: ORIGIN, Accept: "application/json" },
      body: formOf(base),
    }),
    limited,
  );
  assert.equal(res.status, 429);
  assert.equal(calls.length, 0);
});

test("other paths and methods are not served", async () => {
  const get = await worker.fetch(new Request("https://intake.visiutrgv.org/submit"), env);
  assert.equal(get.status, 405);
  const other = await post(base, { path: "/admin" });
  assert.equal(other.status, 404);
});
