# Feasty Outreach Console — Engineering Plan

## 1. Product boundary

Feasty is an internal, single-operator outreach console. The initial pilot is limited to two Instagram accounts. The later target is a larger sender fleet, but the first release must prove that two accounts can be configured, warmed, used for controlled actions, paused safely, and handed back to the operator when anything unexpected occurs.

The dashboard will configure account policies and orchestration. It will not store raw Instagram passwords or expose session cookies to the frontend. Account sessions belong to an approved browser profile/runtime. The panel stores the profile reference, route reference, health state, caps, working hours, and audit history.

The system is designed around five engines and two cross-cutting layers:

> Sources → Collection Engine → Qualification Engine → Campaign Engine → Send Engine → Conversation Engine
>
> Compliance and Observability apply across every stage.

## 2. Account connection and control model

### 2.1 What the operator configures in the panel

For each of the two pilot accounts, the operator will configure:

- Instagram handle and display label.
- Browser-provider or runtime name.
- Browser profile identifier.
- Stable route or proxy reference.
- Cold-message target cap.
- Warm-message ceiling.
- Working hours and timezone.
- Warm-up stage and ramp schedule.
- Enabled/paused state.
- Dry-run-only state.
- Last health check, last stop reason, and operator notes.

### 2.2 Where the login session lives

The operator logs into Instagram manually inside the assigned browser profile. The browser profile holds cookies, local storage, and session state. The Feasty frontend never receives those values.

A separate runtime adapter exposes only controlled operations and status events. The adapter can report `ready`, `complete`, `rate_limited`, `captcha`, `account_warning`, `login_required`, `unexpected_state`, or `error`. A challenge or warning pauses the account and creates an audit event.

### 2.3 What cannot be promised

No engineering design can guarantee that an Instagram account will remain unbanned or undetected. The safety design can reduce operational risk by using conservative caps, stable account-to-route mapping, working hours, cooldowns, idempotency, operator visibility, and immediate stopping on provider warnings. It cannot guarantee platform outcomes.

The implementation will not include CAPTCHA bypassing, stealth fingerprinting, credential exfiltration, covert access, or mechanisms intended to evade platform safeguards.

## 3. Engine map

### 3.1 Collection Engine

**Purpose:** turn a source and rules into candidate records.

**Inputs:** source adapter, keywords, hashtags, location, result ceiling, stop conditions, and research account.

**Outputs:** candidate staging records containing handle, profile fields, source, scrape time, and extraction quality.

**Required behavior:**

- Adapter interface rather than hardcoded provider logic.
- Authorized import adapter first for reliable testing.
- Browser collection adapter behind a separate runtime boundary.
- Stop the account on rate limit, CAPTCHA, warning, or unexpected challenge.
- Deduplicate candidates before creating lead records.
- Run the compliance intake gate before a candidate becomes a lead.

**Status:** UI and job records exist. The persistent collection worker and provider adapter are incomplete.

### 3.2 Qualification Engine

**Purpose:** score and route candidates.

**Deterministic checks:**

- Account age under 12 months when joined date is available.
- Food-truck or target-type fit.
- Operator-entered follower minimum and maximum.
- Include keyword matching with case-insensitive substring OR logic.
- Exclude keyword matching with case-insensitive substring OR logic.
- Recently active within 30 days.
- Verified status when available.

Each check resolves to `passed`, `failed`, or `unknown`. A failed check disqualifies the record. Unknown data stays visible and does not silently disqualify it.

**LLM role:** review ambiguous candidates and provide reasons, but the LLM is not the only gate. A human review step remains required for the pilot.

**Status:** best-effort qualification and operator review exist. Weighted scoring, full per-check persistence, and candidate staging are incomplete.

### 3.3 Compliance Layer

**Purpose:** ensure no engine can contact a prohibited lead.

**Required checks:**

1. Candidate intake.
2. Campaign enrollment.
3. Immediately before a send.

**Rules:**

- Do-not-contact records block contact.
- Opt-out language creates a do-not-contact record and stops automation.
- Source and consent basis are required at intake.
- Unqualified leads cannot enter outreach.
- Contact history prevents re-contact across accounts and campaigns.
- Retention rules later archive or purge records according to policy.

**Status:** central eligibility service, source-basis capture, opt-out detection, persistent do-not-contact table, opt-out API, audit records, and tests are implemented. Campaign enrollment enforcement and send-layer enforcement remain incomplete.

### 3.4 Campaign Engine

**Purpose:** own campaign state and per-lead state.

**Campaign state:** `draft → active → paused ⇄ active → complete`.

**Campaign-lead state:** `queued`, `sent`, `replied`, `stopped`, `booked`, and later `opted_out` or `bounced`.

**Required features:**

- Filter leads by source, scrape date, follower range, keywords, and qualification status.
- Show partially verified leads explicitly.
- Prevent duplicate enrollment.
- Prevent enrollment for do-not-contact records.
- Assign a lead to one sending account.
- Keep assignment stable after enrollment.
- Show campaign counts and rejection reasons.
- Support manual account assignment first; automatic balancing later.
- Preserve variant assignment at enrollment if experiments are enabled later.

**Status:** campaign creation and lifecycle records exist. Campaign-lead join records, filters, assignment, and enrollment gates are the next implementation slice.

### 3.5 Send Engine

**Purpose:** turn approved queued actions into controlled browser-runtime operations.

**Worker responsibilities:**

- Claim jobs safely.
- Use idempotency keys to prevent double sends.
- Enforce account-specific concurrency.
- Enforce working hours and timezone.
- Enforce cold target and warm ceiling.
- Enforce minimum message interval.
- Apply warm-up stage and ramp schedule.
- Choose a stable message variant.
- Record attempted, succeeded, blocked, and stopped outcomes.
- Retry transient failures with capped backoff.
- Pause on provider warning, CAPTCHA, rate limit, or repeated errors.

**Browser action boundary:**

`SendAdapter.send(message, target)` receives a safe, approved action. The adapter operates on the assigned browser profile and returns a structured result. It does not return raw credentials to the dashboard.

**Status:** job records and controls exist. The persistent worker, adapter implementation, idempotency, pacing, and live send path are incomplete.

### 3.6 Conversation Engine

**Purpose:** maintain reply state and move interested leads toward a booked 20-minute Feasty onboarding call.

**Conversation states:**

- No reply
- Interested
- Not interested
- Follow-up
- Booked
- Needs human
- Human owns
- Closed

**LLM capabilities:**

- Read normalized conversation history.
- Use the configured Feasty conversation prompt.
- Ask one useful question at a time.
- Explain the product without inventing facts.
- Detect buying interest.
- Offer the Calendly link when appropriate.
- Keep messages concise and natural.
- Recognize requests for a human.
- Detect negative sentiment, direct questions, or opt-out language.
- Hand the conversation to the operator when a safety or ambiguity rule fires.

**Booking:**

- The primary path is sending the Calendly link.
- The fallback is manual booking by the operator.
- The operator marks the lead as Booked in the inbox.
- No Calendly webhook is required in the current requirements.

**Status:** conversation records, messages, prompt configuration, inbox states, and manual booking state exist conceptually. Reply ingestion, LLM worker orchestration, handoff rules, and one-click booking action remain incomplete.

## 4. Cross-cutting systems

### 4.1 Observability and audit

Every privileged change and automation decision should record actor, action, target, timestamp, and details. The visible audit page is implemented. More engine-specific event types and correlation IDs remain to be added.

### 4.2 Safety and anomaly controls

Required controls include:

- Account cooldown.
- Auto-pause on reply-rate, block-rate, or error-rate anomalies.
- Daily and weekly caps.
- Warm-up ramp.
- Stale review queue reminders.
- Retry with capped backoff.
- Visible stop reasons.
- Operator override with an audit record.

The UI contains health and job controls. The worker enforcement is incomplete.

## 5. LLM integration model

The application should use the configured LLM service only for bounded tasks:

- Ambiguous lead review.
- Conversation response drafting or controlled sending.
- Sentiment and intent classification.
- Opt-out and human-handoff detection.
- Digest summarization.

The LLM must not bypass deterministic compliance checks. A response must be validated against the current lead state, conversation lock state, booking objective, and do-not-contact gate before it can become an outbound action.

The configured API credential belongs on the server. It is not exposed in browser code. Model calls should be logged with a request correlation ID and outcome, but not with unnecessary sensitive content.

## 6. Status by build phase

### Complete

- Canonical source repository.
- Private GitHub repository on `main`.
- Human-readable commit history and contribution rules.
- Responsive console shell.
- Theme switcher.
- Command palette.
- Health strip.
- Leads and audit pagination.
- Audit-log page.
- Account policy UI.
- Campaign and inbox UI foundations.
- Adapter configuration boundary.
- Account cap and route records.
- Best-effort qualification flow.
- Local authentication and owner gating.
- Central compliance eligibility service.
- Source-basis capture at lead intake.
- Opt-out language detection.
- Persistent do-not-contact schema and owner mutation.
- 13 passing automated tests.
- Production build and hosted preview.

### In progress

- Phase 1 final UI polish.
- Campaign-lead enrollment model.
- Campaign filtering and assignment.
- Duplicate detection.
- Lead timeline and notes.
- Inbox opt-out and booking actions.
- Send-layer compliance enforcement.

### Incomplete and required before real automation

- PostgreSQL/Railway migration.
- Clerk authentication migration.
- Persistent queue worker.
- Idempotency keys.
- Retry and backoff.
- Per-account pacing and concurrency.
- Warm-up scheduler.
- Account anomaly auto-pause.
- Browser-runtime adapter.
- Research collection adapter.
- Browser profile provisioning workflow.
- Real reply ingestion.
- LLM conversation worker.
- Human handoff rules in the worker.
- Daily and weekly notification jobs.
- Retention enforcement.
- Analytics and funnel reporting.
- Export and attribution reporting.

### Explicitly deferred by the requirements

- Nine-account production scale.
- Google Maps sourcing.
- A/B experiments.
- CAPTCHA solving.
- Instagram auto-login.
- Reply webhooks.
- Discord notifications.
- Rapport-building follow-ups.
- Calendly webhook integration.
- Multi-tenancy, billing, and white-labeling.

## 7. Required external inputs

### Infrastructure

- Railway PostgreSQL `DATABASE_URL`.
- Clerk secret key.
- Clerk publishable key.
- Production session secret if transitional sessions remain.

### Browser runtime

- Approved browser-runtime/provider decision.
- Two Instagram accounts.
- Two browser profile identifiers.
- Manual login completed in each profile.
- Stable route/proxy reference for each profile.
- Test-account designation.

### LLM

- Server-side LLM API key or configured project secret.
- Approved model and budget.
- Conversation prompt and escalation rules.

### Notifications

- Optional Discord webhook or email provider credential, only when that future phase is activated.

## 8. Definition of done for the two-account pilot

The pilot is complete only when the operator can:

1. Configure two account records in the panel.
2. Attach two browser profile references without storing passwords.
3. Set working hours, caps, warm-up stage, and stable routes.
4. Run an authorized or dry collection.
5. Review deterministic and LLM-assisted qualification output.
6. Enroll only eligible, non-duplicate leads.
7. Queue a dry-run send through the per-account queue.
8. Verify working-hours, cap, interval, and idempotency enforcement.
9. Stop an account on challenge, warning, rate limit, or error spike.
10. Detect a reply and surface it in the inbox.
11. Let the LLM draft or handle safe conversation steps.
12. Hand the conversation to the operator on escalation or opt-out.
13. Mark a Calendly or manually arranged call as Booked.
14. Inspect the complete audit trail.
15. Export results for review.

Live external outreach should remain disabled until all fifteen checks pass using non-production or explicitly authorized test accounts.
