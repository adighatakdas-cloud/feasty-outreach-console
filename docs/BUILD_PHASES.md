# Feasty Outreach Console — Build Phases

## Delivery objective

Build a single-operator operations console for research, qualification, campaign management, controlled outreach, conversation handoff, compliance, and observability. Module 15 is intentionally excluded: there will be no multi-tenancy, billing, or white-label layer in this build.

The implementation will keep external outreach disabled until the compliance layer, audit trail, dry-run worker, account controls, and provider credentials have been tested together.

## Phase 0 — Source and architecture baseline

**Status: complete.**

This phase establishes the source of truth, confirms the current React/Vite + tRPC + Drizzle architecture, inventories the schema and existing procedures, and verifies the baseline with TypeScript, Vitest, and a production build.

The current source passes its baseline checks with 8 tests passing and a successful production build. The project is intentionally still on the initialized MySQL-compatible managed database and local authentication until the requested Railway and Clerk credentials are available.

## Phase 1 — Operations console foundation

**Status: in progress.**

This phase makes the application usable as a daily operations console before any live outreach is enabled.

It includes the responsive dashboard shell, dark/light mode, status strip, command palette, loading and empty states, paginated tables, visible audit-log search and filters, consistent mutation feedback, first-run checklist, and keyboard-accessible table controls.

The acceptance criteria are that an operator can understand system health in one glance, navigate every workspace area with the keyboard, search the workspace, inspect audit history, and use the console at tablet width without horizontal layout breakage.

## Phase 2 — Compliance, lead lifecycle, and CRM depth

**Status: in progress.**

This phase adds do-not-contact and opt-out records, immutable consent/source-basis fields, duplicate detection, data-retention settings, weighted lead scoring, segmentation, campaign lead selection, drag-and-drop assignment, lead notes, operator ownership, and a complete per-lead timeline.

No send action will be able to bypass the compliance service. Compliance will be checked at candidate intake, campaign enrollment, and immediately before a message action.

The first implementation slice adds a central contact-eligibility gate, opt-out language detection, and mandatory source/consent-basis capture at lead intake. The next slice will persist dedicated do-not-contact and campaign-enrollment records.

## Phase 3 — Queue and worker foundation

**Status: planned.**

This phase turns the flat job records into a safe dry-run execution system. It adds typed job contracts, idempotency keys, retry backoff, per-account concurrency, working-hours enforcement, cap enforcement, anomaly detection, automatic account cooldown, warm-up scheduling, and operator-visible stop reasons.

The first worker will process only dry-run and authorized-import jobs. It will not send messages until the operator has explicitly enabled a provider adapter and passed the release checklist.

## Phase 4 — Browser-automation adapter boundary

**Status: planned; credentials and provider decision required.**

The requested route is browser automation rather than the official API. The implementation will use a provider-neutral `CollectionAdapter` and `SendAdapter` interface, with account/session ownership kept separate from the web server.

The automation must stop on CAPTCHA, rate-limit, account warning, or unexpected challenge signals. It will not include CAPTCHA solving, stealth fingerprinting, covert access, credential exfiltration, or controls designed to evade platform safeguards.

This phase requires an approved browser runtime, account/session provisioning decision, stable routes, test accounts, and explicit operator confirmation of the stop-condition behavior.

Accounts will not be connected by placing Instagram passwords in this web application. The console will store only an account record, a provider/profile reference, stable route metadata, health state, and an encrypted secret reference where needed. A separate operator-controlled browser profile or approved automation runtime will hold the actual session. The runtime reports status and stop conditions back to the console; it does not expose raw credentials to the frontend.

## Phase 5 — Conversation and notification engine

**Status: planned.**

This phase adds reply ingestion, normalized messages, conversation state transitions, operator lock and handoff, opt-out language detection, manual booking state, stale-review nudges, daily/weekly digests, and Discord/email delivery through configured notification channels.

## Phase 6 — Analytics, optimization, and API hardening

**Status: planned.**

This phase adds funnel and ROI reporting, cohort views, template versioning, A/B measurement, send-time analysis, API-key rate limits, finer-grained scopes, outbound webhooks, and synchronized API documentation.

## Phase 7 — Infrastructure migration and production release

**Status: blocked on credentials and target-project access.**

This phase migrates the schema and driver to PostgreSQL using Railway, replaces local authentication with Clerk while preserving administrator authorization, configures secrets, runs migration verification, and performs production smoke tests.

Required inputs are:

- Railway PostgreSQL `DATABASE_URL`
- Clerk `CLERK_SECRET_KEY`
- Clerk browser publishable key, normally `VITE_CLERK_PUBLISHABLE_KEY`
- Production `JWT_SECRET` only if retained for transitional sessions
- Approved browser-runtime/session credentials, if used
- Stable route/proxy secret references
- Optional Discord webhook or email provider credentials

## Hosting plan

The current build can run as a temporary preview while development continues. For durable hosting, the managed project should be imported into a persistent web project. A normal request/response deployment is sufficient for Phases 1–2. A persistent worker in Phase 3 can run on a continuously hosted instance within the managed 1 vCPU / 512 MB boundary; the documented full-utilization ceiling is approximately $37.50/month before the included $10 monthly usage credit, with egress metered separately.

A separate cloud computer is only needed if the browser runtime requires OS-level packages, Docker, fixed networking, or more than the managed resource limits.

## Current execution order

1. Finish Phase 1 audit and onboarding UI.
2. Implement Phase 2 compliance and campaign lifecycle foundations.
3. Implement Phase 3 dry-run worker and safety controls.
4. Request Railway, Clerk, and provider credentials.
5. Complete Phase 4–7 integration and production release.

## Release gates

No live external action is enabled until the system has a working opt-out check, immutable source-basis record, audit entry, idempotent dry-run, retry policy, account pause path, visible failure state, and a tested operator handoff.
