# Feasty Outreach Console — Implementation Memory

**This file is the implementation source of truth for future Manus work.** Read it before modifying the project. Do not skip phases or silently change architectural decisions.

## Operating mode

Build a single-operator internal operations console. The immediate release is a two-account pilot. The target architecture must support nine sender accounts and one separate research account without a rewrite.

Implement deterministic product functionality first: lead intake, qualification, compliance, campaigns, queueing, inbox, reports, alerts, audit, and recovery. External provider execution must be behind an adapter and disabled by default.

Do not implement CAPTCHA solving, fingerprint spoofing, stealth automation, provider-safeguard evasion, credential exfiltration, hidden access, or covert telemetry. If a provider reports CAPTCHA, rate limit, account warning, login challenge, or unexpected state, pause the affected account and surface an operator-visible stop reason. **CAPTCHA/challenge handling is explicitly a human-in-the-loop stop state:** `challenge_required -> paused -> operator_resolved -> health_check_passed -> healthy`. There is no solver or bypass path.

## Stack decisions

- Current repository is the functional reference during migration.
- Target frontend direction: Next.js App Router using Kiranism's dashboard structure, ShadCN components, Tailwind v4, TypeScript, Clerk single-user authentication, PostgreSQL, and a typed server API.
- If migration is deferred, preserve the current Vite + tRPC + Drizzle stack temporarily, but do not claim the Next.js/PostgreSQL requirement is complete.
- Use PostgreSQL as the system of record.
- Use BullMQ with Redis/Valkey for the first durable queue. The database remains the business record; Redis is execution transport.
- Consider Temporal only after the pilot demonstrates that long-running workflow durability justifies its operational cost.
- Keep web and worker responsibilities separate even if they share a deployment during the pilot.
- Use provider-neutral `CollectionAdapter` and `MessagingAdapter` interfaces.
- Use Clerk only for identity; keep application authorization and owner role mapping explicit.

## Brand and theme decisions

- Feasty orange remains the brand identity accent and is used sparingly for primary actions, active state, and selected state.
- Dark mode is the default operational mode.
- Adopt the supplied blue semantic theme as the operational color family only through tokens. Do not scatter raw color values through components.
- Every theme token must have both light and dark values.
- Keep brand assets in a versioned manifest. Do not fetch production assets live from Google Drive.
- Use approved logo/emblem SVG or PNG derivatives in the application; keep source artwork restricted.
- Use ShadCN primitives and accessible variants before creating custom controls.

## Mandatory build phases

### Phase 0 — Scope, safety, and architecture lock

1. Read this file and the requirements report.
2. Confirm two-account pilot acceptance criteria.
3. Confirm provider-approved collection and messaging method.
4. Record unresolved credentials and infrastructure blockers.
5. Keep unsafe automation requirements excluded.
6. Decide whether the Next.js migration occurs before Phase 1 or after one vertical slice.
7. Add ADRs for database, queue, auth, adapter, and deployment.
8. Do not enable external sends.

**Exit:** the scope, safety boundary, and target stack are explicit in repository docs.

### Phase 1 — Application shell, theme, auth, and PostgreSQL foundation

1. Adopt or migrate to the Kiranism dashboard structure.
2. Remove SaaS Organizations, billing, and demo modules.
3. Configure single-operator Clerk authentication.
4. Create PostgreSQL schema and migrations.
5. Port Feasty shell, navigation, dark default, blue semantic tokens, orange brand accent, and responsive behavior.
6. Create shared tables, filters, drawers, status badges, confirmations, empty states, error states, freshness labels, and notification center primitives.
7. Create truthful empty routes for Overview, Research, Leads, Campaigns, Inbox, Automations, Reports, Audit, Accounts, Settings, Learning, and Brand Assets.

**Tests:** auth boundary, route access, migration smoke test, theme rendering, keyboard navigation, responsive layout.

**Exit:** the operator can sign in, navigate, configure empty records, and see truthful states against PostgreSQL.

### Phase 2 — Lead intake, provenance, qualification, and compliance

1. Add candidate staging and collection-run records.
2. Implement authorized CSV/API import first.
3. Normalize handles and enforce uniqueness transactionally.
4. Preserve source, source reference, capture time, extraction quality, and observation history.
5. Persist qualification checks as passed/failed/unknown with evidence.
6. Add do-not-contact and opt-out rules.
7. Enforce eligibility at intake, enrollment, queue admission, and immediately before action.
8. Add authenticated CSV export and audit events.

**Exit:** leads can be imported, qualified, reviewed, blocked, exported, and audited with no external send.

### Phase 3 — Campaign lifecycle and dry-run queue

1. Add campaign-lead enrollment and duplicate prevention.
2. Add manual and capacity-aware account assignment.
3. Add versioned message templates and typed sequence definitions.
4. Add campaign preview with rejection reasons.
5. Add dry-run jobs with idempotency keys.
6. Add leases, correlation IDs, retries, pause, resume, cancel, and per-account mutex abstractions.

**Exit:** exact intended actions can be previewed and repeated safely without contacting anyone.

### Phase 4 — Approved provider adapter and account controls

1. Select one approved provider/API or operator-assist method.
2. Implement connection validation and structured result codes.
3. Keep credentials/session state outside the web app.
4. Implement scoped adapter calls and action acknowledgements.
5. Enforce account pause, cooldown, cap, interval, working window, and mutex behavior.
6. Keep first external action behind a release flag and test account.

**Exit:** a provider-approved action can run for one test account and every unsafe provider state stops the account.

### Phase 5 — Reply ingestion, inbox, AI draft, and handoff

1. Ingest or operator-import replies with deduplication.
2. Add conversation state machine and timeline.
3. Detect opt-out and human requests deterministically.
4. Add editable prompt and structured AI classification/draft output.
5. Add operator lock, handback, manual reply, and follow-up cancellation.
6. Add one-click manual/Calendly booking state.
7. Default to AI draft plus operator approval.

**Exit:** replies reach Inbox, can be classified, handed off, booked, and audited without AI/operator overlap.

### Phase 6 — Customer-response alerts and developer alerts

1. Persist immutable response events after inbound-message deduplication.
2. Add configurable rules for every reply, first reply, interested, human-requested, opt-out, booking, and booked.
3. Support in-app, Discord, email, and signed webhook delivery.
4. Add quiet hours, grouping, deduplication, acknowledgements, suppression, retries, and escalation.
5. Add grouped developer alerts for job, queue, provider, AI, report, and notification failures.
6. Never put credentials or unrestricted message content in alerts.

**Exit:** one response creates one event and one delivery per matching rule; repeated failures group into one developer alert.

### Phase 7 — Period-end reports and learning capture

1. Add report rules for daily, weekly, monthly, and custom periods.
2. Freeze timezone-aware period boundaries.
3. Calculate metrics from immutable operational records.
4. Deliver summary reports to Discord/email and show delivery history.
5. Capture learning events for research, qualification, messages, replies, classifications, operator corrections, bookings, opt-outs, and outcomes.
6. Add model/prompt versions, protected evaluation sets, offline evaluation, shadow mode, controlled rollout, and rollback.
7. Never automatically promote a model without evaluation and operator approval.

**Exit:** reports are exactly-once, delivery failures are visible, and every AI decision is reproducible.

### Phase 8 — Brand asset governance and production hardening

1. Maintain a versioned asset manifest from the approved Drive library.
2. Generate optimized derivatives outside the public source bundle.
3. Add `packages/brand` tokens and FeastyLogo/FeastyMark components.
4. Add protected Brand Assets governance page.
5. Add health endpoints, worker heartbeat, backups, restore tests, secret rotation, structured logs, and correlation IDs.
6. Load-test synthetic nine-account concurrency.
7. Complete production runbook and rollback procedure.

**Exit:** two-account pilot is production-operable and nine-account target is validated synthetically before expansion.

## Required domain modules

```text
features/accounts
features/research
features/leads
features/qualification
features/compliance
features/campaigns
features/messaging
features/conversations
features/automations
features/notifications
features/reports
features/learning
features/brand
features/audit
features/settings
```

## Required safety gates

No outbound action may occur unless all are true:

- Account is enabled and not paused, blocked, cooling down, or awaiting re-authentication.
- Campaign is active and release-enabled.
- Lead is qualified according to the campaign policy.
- Lead is not on the do-not-contact list.
- No prior contact violates the campaign policy.
- Conversation is not operator-locked.
- Current cap, interval, working window, and provider readiness pass.
- The action has an idempotency key and audit correlation ID.
- The adapter is approved for the selected operation.

## Required verification before each milestone

```bash
pnpm check
pnpm test -- --run
pnpm build
```

After schema changes:

```bash
pnpm drizzle-kit generate
# inspect generated SQL
# apply through the selected managed database migration path
```

Do not commit `node_modules`, `dist`, credentials, cookies, browser profiles, raw sessions, generated secret files, or large media.

## First implementation slice

Start with Phase 0 and the Phase 1 shell foundation. Then implement the first functional vertical slice:

```text
lead intake -> qualification -> compliance -> campaign preview -> dry-run job -> audit event
```

Do not implement provider spoofing, CAPTCHA solving, anti-detection behavior, or real external sending as part of the first slice.


## Implementation ledger — 2026-09-16

This ledger must be updated in the same change whenever a functional or UX behavior is added or changed.

### Completed UX and safety work

- Reordered navigation to match the operator workflow: Overview, Research, Leads, Campaigns, Accounts, Automations, Inbox, Audit log, Settings.
- Added the Overview setup journey: connect owner, choose approved source, review qualified leads, preview campaign.
- Added truthful preview-mode wording for unauthenticated workspaces.
- Added explicit provider-challenge state handling: `challenge_required -> paused -> operator_resolved -> health_check_passed -> healthy`.
- Deliberately did not implement CAPTCHA solving, spoofing, stealth automation, provider-safeguard evasion, or covert access.

### Completed campaign functional layer

- Added campaign dry-run preview API.
- Dry-run applies qualification, do-not-contact, prior-contact, campaign filter, and quantity-limit decisions.
- Every evaluated lead receives an explicit queue/skip decision and reason.
- Preview creates a persisted `campaign_dry_run` automation job.
- Preview creates a `campaign_dry_run_created` audit event.
- Campaign UI exposes `Preview dry-run` and states that no provider action is sent.

### Completed lead import functional layer

- Added `server/lead-import.ts` normalization and classification module.
- Handles username normalization, source, source reference, consent basis, dates, followers, verified status, and extraction timestamp.
- Runs deterministic qualification during normalization and persists all passed/failed/unknown checks in `qualificationStatus` JSON because candidate-staging/observation tables are not yet present in the current schema.
- Classifies rows as created, duplicate, blocked, or invalid.
- Blocks do-not-contact usernames before insertion.
- Prevents duplicate usernames within one import and against the existing registry.
- Added authenticated `leads.import` batch API, capped at 500 rows.
- Added `lead_imported` audit event with import summary.
- Added Leads UI structured JSON import panel with source, consent basis, validation, result counts, and no-external-send messaging.

### Deliberate deferred/migration follow-ups

- CSV upload is deferred until the normalized import contract is stable; it must call the same `leads.import` contract.
- Candidate staging, collection-run, source-observation, extraction-quality, and history tables remain a required additive migration for full Phase 2 compliance.
- The current repository still uses MySQL/Drizzle; PostgreSQL migration is not claimed complete.
- Import insertion is currently sequential and requires a transactional batch implementation before production scale.
- Campaign preview currently persists decisions in the automation job payload; idempotency keys and campaign-lead enrollment are still required in the next Phase 3 slice.

### Verification ledger

- `pnpm check`: passed.
- `pnpm test -- --run`: passed, 23 tests across 8 files.
- `pnpm build`: passed.
- My Browser verified the repaired navigation, Campaigns dry-run wording, and Leads page entry point.


## Requirements engineering trace — campaign enrollment slice

The requirements document maps this slice to the confirmed workflow steps: campaign filtering, account assignment, deduplication, queue admission, per-account daily caps, and auditability. The implementation deliberately stops before provider execution.

| Requirement | Engineering contract | Current status |
|---|---|---|
| Pull leads from the central registry | `campaigns.preview` evaluates registry leads against campaign policy | Implemented |
| Quantity cap | `maxLeads` limits queued decisions | Implemented |
| Qualification filters | Existing qualification evaluator applies follower, bio, age, verified, and activity rules | Implemented |
| Do-not-contact gate | Blocked usernames never enter enrollment | Implemented |
| Prior-contact dedupe | Existing contact history blocks queue admission | Implemented |
| Campaign enrollment | `campaigns.enroll` creates `campaign_leads` records | Implemented |
| Account assignment | `assignCampaignLeads` filters enabled healthy/warming accounts | Implemented |
| Remaining capacity preference | Accounts are ordered by `coldCap - coldSentToday` | Implemented |
| Round-robin tie-break | Cursor advances after each assignment and is covered by tests | Implemented |
| Parallel account use | Assignments are spread across eligible accounts instead of draining a single account | Implemented |
| Per-account daily cap | No assignment is made beyond `coldCap` | Implemented |
| Repeat-safe enrollment | `campaign:<campaignId>:lead:<leadId>:cold-opener` idempotency key | Implemented in contract and schema; database migration pending |
| Pause/resume campaign semantics | Campaign status already supports draft, active, paused, complete; new sends must later be gated by status | Partially implemented; worker admission remains future |
| Working hours/minimum intervals | Requirements confirmed; not yet enforced because provider worker is not in this slice | Deferred to queue worker phase |
| CAPTCHA solving | Requirements mark it future phase; safe stop-state exists, no solver added | Deferred by explicit safety boundary |
| Browser execution/spoofing | Not implemented; no stealth or safeguard evasion | Excluded |

### Schema migration flag

`campaign_leads.idempotencyKey` was added as a nullable unique field so the change is additive for existing records. A migration must be generated, reviewed, and applied through the managed database path before production use. The repository currently remains MySQL/Drizzle; PostgreSQL migration is not claimed complete.

### Correction log

The first capacity-assignment implementation passed capacity tests but failed the requirement's tie-break behavior by repeatedly selecting the same account after capacities became equal. The cursor logic was corrected to advance after every assignment. The regression suite now covers both remaining-capacity ordering and round-robin tie handling.

### Verification for this slice

`pnpm check` passed. `pnpm test -- --run` passed with 25 tests across 9 files. `pnpm build` passed. The production bundle-size warning remains at approximately 514 kB and is tracked as a hardening item.


## Requirements engineering trace — queue admission slice

The requirements document specifies that automated cold sends must respect each account's working hours, daily cold cap, minimum gap between cold DMs, provider/account health, and duplicate-contact integrity. Manual operator replies are a separate priority lane and are not implemented by this automated admission function.

| Requirement | Engineering contract | Current status |
|---|---|---|
| Per-account working hours | `isWithinWorkingHours` parses account windows including en-dash ranges | Implemented |
| Multiple-session-ready boundary | Admission checks the configured account window; session segmentation remains worker configuration | Partially implemented |
| Cold DM daily cap | `coldSentToday >= coldCap` produces a hold | Implemented |
| Minimum gap between automated cold DMs | `lastActivityAt + minIntervalMinutes` produces a hold and `runAfter` | Implemented; default is 8 minutes within the documented 8–15 minute range |
| Disabled/paused/attention account | Produces hold/reject before external work | Implemented |
| Blocked/cooldown health | Produces hold and preserves cooldown time when present | Implemented |
| CAPTCHA/rate-limit/account warning | `lastErrorCode` produces operator-resolution hold | Implemented as stop state; no solver or bypass |
| Idempotency | Existing key produces reject | Implemented |
| Dry-run worker decision | `jobs.admitDryRun` evaluates enrolled queued records and persists a `queue_admission_dry_run` job | Implemented |
| Auditability | `queue_admission_dry_run_created` records admitted/held/rejected counts | Implemented |
| Real provider execution | Not called by admission engine | Deferred |
| Manual reply priority/mutex | Requirements confirmed but belongs to Inbox/provider worker lane | Deferred |

### Queue admission decision model

Every enrolled cold-send candidate returns exactly one of `admit`, `hold`, or `reject`. `admit` means all internal gates pass; it does not send anything. `hold` means the candidate may become eligible later or requires operator action. `reject` means the idempotency or integrity rule prevents repeating the action.

### Safety boundary

No queue admission code solves CAPTCHA, spoofs fingerprints, rotates IPs to evade detection, or runs a browser. Provider challenge signals stop the account and require operator resolution plus a later health check before eligibility can return.

### Verification

`pnpm check` passed. `pnpm test -- --run` passed with 31 tests across 10 files. `pnpm build` passed. The production bundle-size warning remains at approximately 515 kB and is tracked as hardening.


## Remaining build execution — Phase 3.1 durable worker mechanics

The executable remaining plan is maintained in `docs/REMAINING_BUILD_PHASES.md`. Phase 3.1 is implemented as a pure durable-worker state machine plus authenticated router procedures.

Implemented worker capabilities:

- Queue lease acquisition with worker identity and expiry.
- Expired lease recovery.
- Lease heartbeat restricted to the current worker owner.
- Correlation IDs in the form `job:<id>:attempt:<n>`.
- Retry scheduling through `runAfter`.
- Exactly-once completion guard through active lease ownership and status checks.
- Pause, resume, and cancellation state transitions.
- Structured error code and message persistence.
- Audit events for lease, heartbeat, completion, and rejected worker operations.
- `jobs.lease`, `jobs.heartbeat`, and `jobs.complete` procedures.

Schema flag: `automation_jobs` now has nullable `leaseOwner`, `leaseExpiresAt`, and `correlationId` fields. A migration is required before production use; generation remains blocked until `DATABASE_URL` is configured.

Verification: `pnpm check` passed; `pnpm test -- --run` passed with 37 tests across 11 files; `pnpm build` passed. The bundle-size warning remains approximately 515 kB.

Next required activity is not another isolated backend slice. It is a product-wide functional and UX acceptance pass. Each UI page must be inspected at desktop and mobile widths, its primary workflow exercised, and its loading, empty, error, validation, accessibility, and destructive-action states repaired. Browser acceptance must be recorded separately from build verification.


## Production platform and Learning Lab slice — 2026-09-16

Completed a PostgreSQL migration slice. Drizzle now targets `drizzle-orm/node-postgres`, uses the `pg` pool, and generates PostgreSQL migrations into `drizzle-pg/`. The schema uses PostgreSQL identity columns, JSONB, and PostgreSQL-compatible conflict/returning query APIs. The generated migration is `drizzle-pg/0000_lowly_lady_deathstrike.sql`. It has not been applied because no Railway `DATABASE_URL` exists in this workspace; application must happen against staging first.

Added Railway and Clerk environment scaffolding. The local auth flow remains the preview fallback until Clerk callbacks and server-side token verification are configured. Added `client/src/_core/clerk-config.ts` as the future Clerk feature boundary and documented the exact setup in `docs/PLATFORM_SETUP.md`.

Added the dedicated **Feasty Learning Lab** route. It reads live learning event counts from the workspace snapshot, loads persisted stage configuration, calculates a recommended stage, shows thresholds and approval requirements, and saves a governed stage configuration through `config.saveSection`. Stages are Capture, Review, Evaluate, Shadow, Controlled rollout, and Approved active. The shared contract lives in `shared/learning-stages.ts`; tests cover event thresholds and approval gating.

Verification after this slice: TypeScript passed, 40 tests passed across 12 files, and the production build passed. The remaining build warning is the existing bundle-size warning for the main frontend chunk.
