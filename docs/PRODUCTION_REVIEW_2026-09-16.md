# Production-style review — 2026-09-16

## Review method

The running Feasty development server was inspected through the connected My Browser session using the public sandbox preview URL. The review covered Overview, Settings > Safety, Settings > Connections, Settings > Developer, and Leads. Repository verification was also run before the browser review.

## Verified strengths

The current shell has a persistent operations sidebar, a clear workspace identity, a dark operational theme, a global status strip, a primary workspace content area, and a persistent quick-access affordance. The Overview page is appropriately focused on healthy accounts, active jobs, leads to review, open conversations, attention items, workload state, and recent activity rather than decorative analytics.

The empty states are truthful. The Overview reports no records rather than inventing activity. Leads says that no matching leads exist and explains that an approved source or import is needed. Settings clearly says that connections remain off until authorized credentials are added and the health check passes.

The safety settings are appropriate for a pilot: approval before real outreach, autonomy levels, retry limits, and pause-after-failure controls are visible and grouped together. The Connections page distinguishes official API access, operator help, and not-connected state. The Network route copy explicitly says it is never used for evasion or covert access. The Developer page presents scoped read/write API keys and states that keys are hashed and shown only once.

The current build has a coherent visual language: dark surfaces, Feasty orange as the action accent, restrained status colors, dense operational cards, visible focus affordances, and a responsive sidebar pattern. The UI direction is compatible with a production internal tool.

## Current production blockers

| Area | Finding | Release implication |
|---|---|---|
| Authentication | Preview shows `Owner setup required` and `Sign in to connect data`; the local environment does not have `OAUTH_SERVER_URL` configured. | Do not call this production-ready until the deployed auth callback, owner mapping, session expiry, and forbidden state are tested. |
| Data layer | Browser pages show zero records because the preview is not connected to a production-like database fixture or managed database. | Add a staging database and migration smoke test; do not use fake dashboard values. |
| Functional UI | Leads has search/filter/import structure, but import, research, campaign preview, Inbox response handling, and period reports are not yet verified end-to-end in the browser. | Keep these as explicit phase exit gates. |
| Alerting | The target architecture includes response alerts and developer alerts, but the current navigation/settings review did not expose a dedicated notification center or delivery history. | Add the response event pipeline and notification center before any external pilot action. |
| Reporting | Discord/email report rules and delivery attempts are not yet visible as a complete user workflow. | Implement period freeze, report run, delivery status, retry, and failure visibility. |
| Learning | The current shell does not expose model versions, operator corrections, evaluations, shadow mode, or rollback. | Add the Learning page and governance controls before claiming adaptive ML. |
| Brand governance | The Feasty logo is present, but a protected asset manifest/derivative governance page is not yet visible. | Add the asset manifest and verify light/dark variants before final release. |
| Deployment | The browser displays the Manus preview-mode banner and the public preview is not a published production URL. | Publish to a real staging environment and test TLS, auth redirects, health checks, and worker lifecycle. |
| Accessibility | Desktop inspection shows visible focus-oriented controls and semantic labels. A complete keyboard-only, screen-reader, contrast, and mobile pass remains outstanding. | Add automated accessibility checks and manual keyboard/mobile acceptance. |
| Observability | UI status cards show health/queue/adapters, but the end-to-end correlation ID, worker heartbeat, grouped developer alert, and runbook link are not yet verified. | Add operational telemetry before provider integration. |

## Build-phase validity decision

The build phases are valid for production-style delivery **provided that the phase exits remain hard gates**. The order is correct because it puts durable records, deterministic compliance, dry-run behavior, and operator visibility ahead of external provider execution.

The phases must not be compressed into a single “automation” milestone. In particular:

1. Do not move provider integration before dry-run and audit behavior is verified.
2. Do not move AI auto-replies before reply ingestion, operator lock, opt-out detection, and handoff are verified.
3. Do not move period reports before immutable event records and exactly-once report runs exist.
4. Do not call research “learning” until operator labels, dataset versions, evaluation, shadow mode, and rollback exist.
5. Do not call the browser runtime production-ready if it depends on spoofing, CAPTCHA solving, or provider-safeguard evasion.
6. Do not treat a preview URL as a production deployment.

## Required next browser acceptance pass

After Phase 2 and the first database migration, repeat this exact flow in My Browser:

1. Sign in through the deployed auth callback.
2. Verify an unauthorized user receives a clear forbidden state.
3. Import one authorized synthetic lead and one duplicate.
4. Verify provenance, qualification evidence, and duplicate behavior.
5. Add one do-not-contact record and verify it blocks campaign preview.
6. Preview a campaign and inspect every queued and skipped reason.
7. Run a dry-run job and verify audit, idempotency, pause, retry, and cancellation behavior.
8. Create a synthetic inbound response and verify Inbox, response event, notification center, Discord/email delivery status, and acknowledgment.
9. Generate a custom-period report and verify frozen timezone boundaries and delivery history.
10. Verify a simulated worker/provider failure becomes a grouped developer alert without leaking secrets.

## Verification baseline

The post-implementation repository checks are currently green:

- TypeScript check passed.
- 18 tests passed across 6 test files.
- Production build passed.
- Build output still reports a JavaScript bundle over 500 kB; code-splitting remains a hardening item, not a pilot blocker.
