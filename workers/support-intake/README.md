# VISI support intake

Backend for the Contact and Support page at `https://visiutrgv.org/support/`.

```
visitor's browser
  │  form POST + Turnstile token
  ▼
intake.visiutrgv.org  (this Worker)
  │  1. Origin check        only visiutrgv.org may post
  │  2. rate limit          5 per IP per minute
  │  3. honeypot            bots fill a hidden field, get a fake "ok"
  │  4. validation          allowlisted types, fields, lengths, choices
  │  5. Turnstile verify    server side, checks hostname and action
  ▼
Jira automation "Incoming webhook" rule (visiutrgv.atlassian.net)
  │  creates the customer, then the request with the right request type
  ▼
VISI help center queue  →  agents reply by email, visitor tracks in the portal
```

## Why a webhook and not the JSM REST API

- Creating a request in someone else's name through the REST API (`raiseOnBehalfOf`) requires an account with a JSM **agent** license. On the Free plan that would take one of the 3 agent seats.
- An automation rule with an Incoming webhook trigger runs as Automation for Jira. It can create the customer and the request with that customer as the reporter, and it uses no seat.
- The Worker only holds the webhook URL and secret. Those can create tickets and nothing else. A leaked API token could read every ticket in the project.
- Tradeoff: the webhook is asynchronous, so the confirmation page can't show the ticket number. JSM emails it to the visitor.

## Files

| File | What it is |
|---|---|
| `src/index.js` | The Worker |
| `test/index.test.js` | Tests. Run `npm test` (plain Node, no install needed) |
| `package-lock.json` | Empty npm lockfile so Cloudflare's build uses npm here, not the root pnpm workspace |
| `wrangler.jsonc` | Worker name, hostname, rate limit, non-secret vars |
| `.dev.vars.example` | Template for local secrets |
| `../../jekyll/support.html` | The page. The request type dropdown is built from `jekyll/_data/support_types.yml` |
| `../../jekyll/assets/support.js` | Preselects `?topic=`, hides unrelated fields, submits with fetch |
| `../../jekyll/_headers` | CSP for `/support/*` that allows Turnstile and nothing else external |

The request type ids (`general`, `membership`, `partnership`, `research`, `clinic`, `event`, `range`, `security`, `other`) appear in three places: `REQUEST_TYPES` in `src/index.js`, `_data/support_types.yml`, and the branches of the Jira rule. Change all three together.

---

## Setup

Order matters: Jira first (you need its webhook URL), then Turnstile, then the Worker, then the site.

### 1. Jira: request types

In `visiutrgv.atlassian.net`, open the service project > **Project settings > Request types**. Create one per row. Keep the summary and description fields; you don't need custom fields because the Worker puts everything into the description.

| Request type name | Webhook `type` |
|---|---|
| General question | `general` |
| Join VISI | `membership` |
| Partnership or sponsorship | `partnership` |
| Research collaboration | `research` |
| Security clinic request | `clinic` |
| Event or speaker request | `event` |
| Range or account help | `range` |
| Security report | `security` |
| Other | `other` |

### 2. Jira: the automation rule

**Project settings > Automation > Create rule.**

1. **Trigger: Incoming webhook.** Set "Execute this rule using" to **No work items from the webhook**. This means the rule doesn't look up existing tickets; it just receives data. Save the trigger and copy the **Webhook URL** and **Secret**. You'll paste them into the Worker in step 4.
2. **Action: Create customer.** Email `{{webhookData.email}}`, Display name `{{webhookData.name}}`. This makes the visitor a portal customer so they can see their request and get replies.
3. **If/else block**, one branch per type. Condition: **Advanced compare condition**, first value `{{webhookData.type}}`, operator **equals**, second value `general` (then `membership`, and so on).
4. Inside each branch: **Create service request** (newer UIs may label it "Create work item" with a request type option).
   - Request type: the one matching that branch
   - Raise on behalf of / Reporter: **Customer created by this rule**
   - Summary: `{{webhookData.summary}}`
   - Description: `{{webhookData.description}}`
5. Name the rule `Website support intake` and turn it on. The rule only receives data while it is enabled.

Test it before wiring the Worker. This sends one fake request straight to the rule:

```bash
curl -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -H "X-Automation-Webhook-Token: $WEBHOOK_SECRET" \
  -d '{"type":"general","email":"you@utrgv.edu","name":"Test","summary":"[General question] test","description":"test"}'
```

- `-X POST` sends a POST, which is what the trigger listens for
- `Content-Type: application/json` is required. Without it `{{webhookData}}` comes through empty
- `X-Automation-Webhook-Token` is how Jira checks the caller knows the secret
- `-d` is the body. These are the same keys the Worker sends

Check the rule's **Audit log**, then check the ticket's reporter is the customer, not Automation for Jira. Run it twice with the same email to confirm **Create customer** doesn't fail on someone who already exists. If it does, move it into a branch behind a "user does not exist" check.

Keep the existing Discord routing rules from `contact-portal-and-help-center.md` section 5. They trigger on "work item created", so they fire for website tickets too. Clinic and security tickets still post a link only.

### 3. Cloudflare: Turnstile widget

Dashboard > **Turnstile > Add widget**.

- Hostnames: `visiutrgv.org` and `www.visiutrgv.org`
- Widget mode: **Managed** (most people never see a challenge)
- Copy the **site key** into `jekyll/_config.yml` as `support.turnstile_sitekey`. The site key is public; it's in the page HTML
- Keep the **secret key** for the next step. It never goes in the repo

The config ships with Cloudflare's always-pass test site key. That's safe to deploy by accident: production secrets reject test tokens, so submissions fail closed until you swap it.

### 4. Cloudflare: deploy the Worker

**From the dashboard (what VISI uses):** Workers & Pages > Create application > Import a repository > `dsuyu1/visi`.

- Project name `visi-support-intake` (must match `name` in `wrangler.jsonc`)
- Root directory `workers/support-intake`, build command blank, deploy command `npx wrangler deploy`
- Build watch paths `workers/support-intake/*`, so website changes don't redeploy the Worker
- Add the three secrets under Settings > Variables and Secrets, type **Secret**

This folder has its own `package-lock.json` on purpose. The repo root has a pnpm workspace file from the Next.js app, and without a local npm lockfile the build runs `pnpm install` and fails with "packages field missing or empty". The Worker has no dependencies; `npx` fetches wrangler at deploy time.

**From a terminal**, in `workers/support-intake/`:

```bash
npx wrangler login
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put JIRA_WEBHOOK_URL
npx wrangler secret put JIRA_WEBHOOK_SECRET
npx wrangler deploy
```

- `npx wrangler` downloads Cloudflare's CLI on first use and runs it; nothing is added to the repo
- `wrangler login` opens a browser to authorize the CLI against your Cloudflare account
- `wrangler secret put NAME` prompts for a value and stores it encrypted on Cloudflare. It's available to the Worker as `env.NAME`, never shown again, and never in git
- `wrangler deploy` uploads `src/index.js` with the settings in `wrangler.jsonc`. Because `routes` uses `custom_domain: true` and `visiutrgv.org` is already a zone on your account, Cloudflare creates the `intake` DNS record and certificate for you
- The first `secret put` may ask to create the Worker if it doesn't exist yet. Say yes

Smoke test that it's up and rejecting strangers:

```bash
curl -i -X POST https://intake.visiutrgv.org/submit -H 'Origin: https://evil.example'
```

You should get `403`. No Origin, or the wrong one, means the request didn't come from the VISI page.

### 5. The site

Merge the branch and let Cloudflare Pages build. Then:

- Set `support.portal_url` in `_config.yml` to your actual portal link (Jira shows it under **Channels > Customer portal**, for example `.../servicedesk/customer/portal/1`)
- Open `/support/`, send a General question to yourself, and confirm the ticket, the reporter, the confirmation email, and the Discord ping
- `/contact/` now redirects to `/support/`, and `/join` goes to `/support/?topic=membership`

---

## Limits to keep in mind

- **Email:** Jira Free sends at most 100 emails a day, counting customer notifications, agent notifications, and automation emails together. After that, emails pause until the next day; tickets still get created
- **Automation:** every submission is one rule run. Check usage under **Automation > Usage**
- **Rate limit:** the Workers rate limit is counted per Cloudflare location, so it's approximate. It's there to stop floods, not to be exact. Add a WAF rate limiting rule on `intake.visiutrgv.org` if you ever see abuse
- **No attachments:** on purpose. Clinic and security conversations move to a private channel after the first reply

## What's left out on purpose

- **Access requests and permission changes.** They need verified identity and approval, which the range access design handles through Keycloak (`range-access-portal.md`). A public form can't prove who someone is
- **Logging personal data.** The Worker logs the request type and error codes only. Names, emails, and messages exist in Jira and nowhere else

## Local development

```bash
cp .dev.vars.example .dev.vars
npx wrangler dev
```

`wrangler dev` runs the Worker on `localhost:8787` and reads secrets from `.dev.vars` (gitignored). The test Turnstile secret always passes, but its responses may not report `visiutrgv.org` as the hostname, in which case a local end-to-end run fails the hostname check. That's expected; `npm test` covers the logic with mocked Turnstile and Jira.
