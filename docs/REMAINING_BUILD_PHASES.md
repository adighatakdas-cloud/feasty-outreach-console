# Feasty Outreach Console — Remaining Build Phases

This document is the execution plan for the remaining work after the initial shell, lead import, campaign enrollment, and queue-admission slices. Each phase has a functional exit gate and a separate UI/UX acceptance pass. External provider execution remains disabled until all applicable gates pass.

## Phase 3.1 — Durable dry-run worker mechanics

Implement leases, correlation IDs, per-account mutex decisions, retry/run-after behavior, pause/resume/cancel semantics, idempotent completion, crash recovery, and structured result codes. The worker must re-run queue admission immediately before any future action and must never treat an `admit` result as permission to contact a provider.

**Exit gate:** synthetic queued jobs can be leased, held, retried, paused, resumed, cancelled, and completed exactly once; an expired lease can be recovered; every state transition has a correlation ID and audit record.

## Phase 3.2 — Campaign lifecycle completion

Add campaign filter editing, campaign-lead enrollment management, drag-and-drop/manual assignment, account-capacity visualization, release-enabled state, pause behavior, sequence definitions, versioned templates, and non-destructive campaign resume. Pausing stops new cold work but does not interrupt active conversations.

**Exit gate:** an operator can configure a draft, preview decisions, enroll leads, assign accounts, pause/resume a campaign, and inspect all rejection reasons without external action.

## Phase 3.3 — Phase 2 data hardening

Configure the managed database, generate/review/apply migrations, add candidate staging, collection runs, source observations, extraction quality, import transactions, unique indexes, authenticated export, and migration smoke tests.

**Exit gate:** staging data survives migration, rollback/restore testing, duplicate imports, partial evidence, and export verification.

## Phase 4 — Approved provider adapter and account controls

Select one approved API or operator-assist method. Implement connection health, scoped calls, structured provider results, action acknowledgements, account cooldown, test-account release flags, and challenge stop states. Do not implement CAPTCHA solving, stealth, spoofing, or safeguard evasion.

**Exit gate:** one approved test action can be simulated and, only after separate approval, executed with a complete audit trail and automatic stop on unsafe provider signals.

## Phase 5 — Reply ingestion, Inbox, AI draft, and handoff

Implement immutable inbound events, deduplication, conversation timelines, opt-out/human-request detection, AI classification, editable prompt/model versioning, operator lock/handback, manual reply priority lane, follow-up cancellation, and manual/Calendly booking state.

**Exit gate:** synthetic replies reach Inbox, are classified, can be handed to an operator, booked, acknowledged, and audited without AI/operator overlap.

## Phase 6 — Customer-response and developer alerts

Implement in-app notifications, configurable response rules, Discord/email delivery, delivery history, quiet hours, grouping, suppression, acknowledgement, retries, escalation, and grouped developer alerts. Keep credentials and unrestricted message content out of alert payloads.

**Exit gate:** one inbound event creates exactly one matching delivery per rule, repeated failures group correctly, and operators can acknowledge/retry/suppress safely.

## Phase 7 — Reports and learning governance

Implement daily/weekly/monthly/custom reports with frozen timezone boundaries, exactly-once report runs, immutable metrics, Discord/email delivery, delivery history, learning-event capture, model/prompt versions, evaluation sets, shadow mode, rollout approval, and rollback.

**Exit gate:** a report is reproducible for a frozen period and every AI decision is explainable and versioned.

## Phase 8 — Full UI/UX production pass

Audit every page in My Browser at desktop and mobile widths. Review navigation, page purpose, first action, empty/loading/error states, forms, validation, keyboard order, focus, screen-reader labels, data tables, destructive actions, confirmation patterns, responsive behavior, and cross-page terminology. Repair each workflow rather than only changing colors or spacing.

Required page sequence:

1. Overview and setup journey
2. Research collection and review
3. Leads import, qualification, compliance, and export
4. Campaign draft, filters, enrollment, assignment, preview, and pause
5. Accounts, caps, working hours, route, health, and challenge resolution
6. Automations, queue, worker state, retries, leases, and diagnostics
7. Inbox, conversation ownership, booking, and handoff
8. Audit log and detail inspection
9. Settings, adapters, safety, prompt, developer access, and notifications
10. Reports, Learning, and Brand Assets pages once introduced

**Exit gate:** each page has a tested primary task, no dead-end action, truthful state, responsive layout, accessible controls, and a browser acceptance record.

## Phase 9 — Production hardening and release

Configure staging and production, authentication, database migrations, secrets, health endpoints, worker heartbeat, structured logs, correlation IDs, backups, restore tests, alert escalation, load tests, runbooks, rollback, and controlled two-account pilot release.

**Exit gate:** the two-account pilot is operable, observable, recoverable, and externally disabled by default until the explicit release checklist is accepted.

## Mandatory checks for every phase

```bash
pnpm check
pnpm test -- --run
pnpm build
```

Browser acceptance must be recorded separately. A green build is not a UX acceptance result. A polished UI is not a functional acceptance result.
