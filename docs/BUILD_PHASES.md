# Feasty Outreach Console — Build Phases

The exact implementation sequence is maintained in [`IMPLEMENTATION_MEMORY.md`](./IMPLEMENTATION_MEMORY.md). This document is the milestone checklist.

The executable post-baseline plan, including the page-by-page UX acceptance pass, is maintained in [`REMAINING_BUILD_PHASES.md`](./REMAINING_BUILD_PHASES.md).

## Phase 0 — Scope, safety, and architecture lock

Lock the two-account pilot, provider-approved execution method, PostgreSQL/Next.js migration decision, queue decision, authentication boundary, and reporting/privacy rules. External sends remain disabled. Unsafe automation requirements are excluded.

**Exit:** architecture decisions and safety boundaries are documented.

## Phase 1 — Application shell, theme, auth, and PostgreSQL foundation

Adopt the Kiranism dashboard structure or document why migration is deferred. Remove organizations/billing/demo modules. Configure Clerk single-user auth, PostgreSQL migrations, dark default mode, semantic blue tokens, Feasty orange accent, shared ShadCN primitives, truthful empty routes, tables, filters, drawers, status badges, confirmations, freshness labels, and notification-center primitives.

**Exit:** the operator can authenticate, navigate, and see truthful empty states against PostgreSQL.

## Phase 2 — Lead intake, provenance, qualification, and compliance

Implement candidate staging, authorized import, source provenance, normalized handles, observation history, tri-state qualification checks, do-not-contact, opt-out detection, duplicate-contact checks, and audited export.

**Exit:** leads can be imported, qualified, reviewed, blocked, exported, and audited without sending.

## Phase 3 — Campaign lifecycle and dry-run queue

Implement campaign enrollment, duplicate prevention, account assignment, versioned templates, typed sequences, campaign preview, idempotent dry-run jobs, leases, correlation IDs, retries, pause/resume/cancel, and mutex abstractions.

**Exit:** exact intended actions can be previewed and repeated safely without contacting anyone.

## Phase 4 — Approved provider adapter and account controls

Select one approved provider/API or operator-assist method. Implement connection validation, structured results, scoped actions, account pause/cooldown/cap/interval/working-window enforcement, and a release flag for one test account.

**Exit:** one provider-approved test action works and unsafe provider states stop the account.

## Phase 5 — Reply ingestion, Inbox, AI draft, and handoff

Implement reply ingestion, deduplication, conversation states, opt-out and human-request detection, editable prompts, structured AI classifications/drafts, operator lock/handback, manual replies, follow-up cancellation, and one-click booking. Default to AI draft plus operator approval.

**Exit:** replies reach Inbox and can be classified, handed off, booked, and audited without overlap.

## Phase 6 — Customer-response and developer alerts

Implement immutable response events, configurable response rules, in-app/Discord/email/signed-webhook delivery, quiet hours, grouping, acknowledgements, suppression, retries, escalation, grouped developer alerts, and protected diagnostic links.

**Exit:** one response creates one event and one matching delivery; repeated failures group into one developer alert.

## Phase 7 — Period-end reports and learning capture

Implement timezone-aware report rules, exactly-once report runs, immutable metrics, Discord/email reports, learning events, operator corrections, model/prompt versions, protected evaluation data, offline evaluation, shadow mode, controlled rollout, and rollback.

**Exit:** reports are reproducible and every AI decision is explainable and versioned.

## Phase 8 — Brand asset governance and production hardening

Maintain a versioned Drive-derived asset manifest, optimized derivatives, `packages/brand`, Feasty logo components, protected asset governance, health endpoints, worker heartbeats, backups, restore tests, secret rotation, structured logs, and synthetic nine-account load tests.

**Exit:** the two-account pilot is operable and the target-state fleet is validated synthetically.

## Release gates

No external action is enabled until compliance, duplicate prevention, idempotency, account pause, visible stop reasons, operator handoff, audit, worker recovery, and notification failure handling are tested together.

Required checks for every milestone:

```bash
pnpm check
pnpm test -- --run
pnpm build
```
