// /support/ page behavior. The form works as a plain POST too; this adds:
// 1. preselecting the request type from ?topic=
// 2. disabling fields that don't apply to the chosen type
// 3. submitting with fetch so errors show inline and typed text isn't lost
const form = document.getElementById("support-form");
const status = form.querySelector(".form-status");
const submit = form.querySelector(".support-submit");
const typeSelect = form.elements.type;
const groups = [...form.querySelectorAll(".field-group")];
const fallback = form.dataset.fallbackEmail;
const orEmail = fallback ? ` You can also email ${fallback}.` : "";

// Older links used ?topic=discord. Keep them working.
const TOPIC_ALIASES = { discord: "membership", contact: "general" };

const MESSAGES = {
  bad_origin: "This form can only be sent from visiutrgv.org.",
  too_large: "That message is too long. Please shorten it.",
  rate_limited: "Too many requests from your network. Wait a minute and try again.",
  verify_failed: "The spam check didn't pass. Please complete it again and resend.",
  upstream: `We couldn't reach our ticket system. Please try again in a few minutes.${orEmail}`,
  network: `Couldn't send. Check your connection and try again.${orEmail}`,
};

const FIELD_NAMES = {
  type: "a request type",
  name: "your name",
  email: "a valid email address",
  subject: "a subject",
  message: "a message",
  organization: "your organization",
  domains: "your domains",
  affected: "the affected site or system",
  event_date: "a valid event date",
};

function showStatus(text) {
  status.textContent = text;
  status.hidden = false;
}

function applyType() {
  const chosen = typeSelect.value;
  for (const group of groups) {
    const on = Boolean(chosen) && group.dataset.for.split(" ").includes(chosen);
    group.hidden = !on;
    // Disabled fields aren't submitted, so hidden answers never reach Jira.
    for (const input of group.querySelectorAll("input, select, textarea")) input.disabled = !on;
  }
}

const params = new URLSearchParams(location.search);
const topic = params.get("topic");
if (topic) {
  const wanted = TOPIC_ALIASES[topic] || topic;
  if ([...typeSelect.options].some((o) => o.value === wanted)) typeSelect.value = wanted;
}
// Links from other VISI pages (e.g. a paused app's page on the hub) can
// suggest a subject. Plain text only, and the visitor can change it.
const subject = params.get("subject");
if (subject && !form.elements.subject.value) form.elements.subject.value = subject.slice(0, 150);
const error = params.get("error");
if (error && MESSAGES[error]) showStatus(MESSAGES[error]);

form.addEventListener("change", (event) => {
  if (event.target.name === "type") applyType();
});
applyType();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submit.disabled = true;
  status.hidden = true;

  let result;
  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    result = await res.json();
  } catch {
    result = { ok: false, code: "network" };
  }

  if (result.ok) {
    const type = typeSelect.value;
    location.assign(`${form.dataset.sentUrl}?type=${encodeURIComponent(type)}`);
    return;
  }

  if (result.code === "invalid" && result.field) {
    showStatus(`Please check ${FIELD_NAMES[result.field] || "the highlighted field"}.`);
    form.querySelector(`[name="${CSS.escape(result.field)}"]`)?.focus();
  } else {
    showStatus(MESSAGES[result.code] || MESSAGES.network);
  }
  // Turnstile tokens are single use. Get a fresh one for the next try.
  if (window.turnstile) window.turnstile.reset();
  submit.disabled = false;
});
