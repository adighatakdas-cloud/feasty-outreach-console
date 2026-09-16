# Feasty Outreach Suite

Feasty Outreach Suite is an internal operations console for research, qualification, campaign management, operator handoff, and controlled outreach execution. It is designed around explicit configuration, durable audit history, and safe failure behavior rather than hidden automation.

## Current release

This repository contains a **production-oriented internal foundation**. It includes authenticated workspace access, administrator-only control mutations, live database-backed pages, research collection configuration, review queues, campaign records, adapter configuration, stable per-account network-route configuration, job controls, API clients, and audit-oriented failure handling.

The supplied product requirements target PostgreSQL on Railway, Next.js, and Clerk. The current WebDev project remains on the initialized React/Vite + tRPC + Drizzle + managed MySQL-compatible database stack because the previous iteration explicitly deferred a destructive database/framework migration. The migration gap is documented rather than hidden.

## Features

- Authenticated workspace sessions with administrator-gated control mutations.
- Research suite for configurable collection rules, source selection, review modes, and controlled handoff into campaigns.
- Lead registry with explicit qualification verdicts and operator review actions.
- Sender-account records with caps, working hours, status, pause/resume, and health history.
- Stable per-account proxy-route records with protocol, host, port, secret reference, enablement, and last health/error state. The worker supports bounded health-first failover across configured routes; it does not perform stealth identity evasion.
- Campaign drafts, status controls, follow-up policy fields, and A/B experiment storage.
- Adapter catalog for Instagram/Meta, Google Maps, Discord notifications, and network routing using official API, operator-assist, or disabled modes.
- Automation queue with retry, pause, cancel, status, and failure classification controls.
- Plain-language safety controls with raw JSON available only under an advanced troubleshooting disclosure.
- Scoped external API keys. Raw keys are displayed once, hashed at rest, and revocable from the workspace.
- No synthetic lead, account, conversation, job, or campaign records are rendered.

## Authentication and authorization

The application uses the initialized secure OAuth session provider through the server context. The browser never manages session cookies directly. Read-only preview is available without a session, while workspace data and all mutations require authentication. Mutations that change accounts, campaigns, adapters, jobs, settings, API clients, or proxy routes require the administrator role.

For a production deployment, set the session secret, OAuth application values, owner identity, and database URL through server-side environment configuration. Do not commit `.env` files or credentials. The owner identity is promoted to administrator during user upsert; additional administrator assignment should be a deliberate database change with an audit record.

The fill-in template is `.env.example`. The current runtime remains on the initialized OAuth session and MySQL-compatible driver until the Railway and Clerk migration is deliberately completed. When those values are available, the migration should be applied as a reviewed change rather than silently switching production drivers. Clerk's server key belongs only in server environment configuration; its publishable key may be supplied to the browser build. Instagram passwords, cookies, and browser profile data do not belong in either file.

## Local development

```bash
pnpm install
pnpm dev
```

The project uses Node 22, TypeScript, React, tRPC, Drizzle, and Vitest. Useful commands:

```bash
pnpm check       # TypeScript
pnpm test        # Vitest
pnpm build       # Vite + server production bundle
pnpm format      # Prettier
pnpm worker:once # Process queued jobs once; requires DATABASE_URL
pnpm worker      # Run the separate persistent worker loop
```

### Functional execution layer

The repository includes an executable worker boundary in `server/execution-engine.ts` and `server/worker.ts`. The worker leases runnable jobs, dispatches them to a compatible adapter, records route health, completes jobs through the existing durable state machine, and fails closed when an adapter is missing. `authorized_import_dry_run` and `send_dry_run` are included for end-to-end queue verification without external traffic.

Configured routes are selected per account in health-first order. A transient route failure may move to the next configured route in the same bounded cycle; challenge, block, and rate-limit results stop the attempt and are surfaced for operator review. Route credentials are referenced by `secretRef` and are not loaded into the dashboard or persisted in job payloads. SOCKS5 is represented in configuration but requires an approved runtime transport before it can execute.

The lead-scoring layer in `server/lead-scoring.ts` is an explainable baseline model. It normalizes follower, engagement, activity, location, keyword, and verification signals, returns reasons and a model version, and can fit a deterministic perceptron from operator-labeled examples. Fitted weights are offline/shadow artifacts until a governed approval promotes them. The model does not bypass compliance or human review.

Database changes follow this sequence:

```bash
pnpm drizzle-kit generate
# review drizzle/<migration>.sql
# apply the reviewed SQL through the managed database migration tool
```

Never apply an unreviewed migration to a production database. Existing migrations are additive in the current branch.

## API

The versioned REST API is available under `/api/v1`:

- `GET /api/v1/health` — unauthenticated service check.
- `GET /api/v1/leads` — requires a `read` API key.
- `GET /api/v1/campaigns` — requires a `read` API key.
- `GET /api/v1/accounts` — requires a `read` API key.
- `POST /api/v1/jobs` — requires a `write` API key and queues a controlled job.

Use `Authorization: Bearer fsty_live_…`. Create and revoke keys from **Settings → Developer access**. The full token is returned only at creation time.

## Research and proxy model

Research collection is deliberately separate from sender accounts. A research run is configured with a source, terms, result ceiling, and review policy. It should run through a dedicated research account and stable route. A collection run stops on a CAPTCHA or rate-limit signal, preserves collected records, and requires operator review before any outreach handoff.

Proxy configuration is for authorized network routing and diagnostics. The intended mapping is one route per account and one browser profile per account. The worker can fail over between explicitly configured routes after a transient transport failure, records the attempt and outcome, and stops on provider challenges. Credentials belong in a server-side secret manager and are referenced through `secretRef`; the UI does not store passwords. Stealth fingerprinting, CAPTCHA bypass, and covert IP switching are not implemented.

## Security posture

- No hidden owner backdoors or covert access paths.
- No credential exfiltration, client-side secret persistence, or raw proxy password storage.
- All control writes are authenticated and audit logged.
- External adapters remain disabled until configured and health-checked.
- Job failures are visible, retryable, pausable, and cancellable.
- CAPTCHA and rate-limit signals are stop conditions, not retry triggers.
- API keys are stored as SHA-256 hashes and can be revoked.

## Production checklist

Before enabling real external work:

1. Confirm the database target and complete the planned PostgreSQL/Railway migration if that remains a release requirement.
2. Confirm the final authentication provider decision and rotate all session/application secrets.
3. Configure one dedicated research account and one stable route; configure sender accounts separately.
4. Add adapter credentials through a server-side secret manager and run health checks.
5. Set working hours, daily caps, session gaps, review rules, follow-up policy, and operator approval defaults.
6. Test collection, review, campaign handoff, job pause, cooldown, and API-key revocation with non-production credentials.
7. Enable external actions only after audit logging and alert delivery have been verified.

## License and ownership

The application code is intended to be owned and operated by the Feasty team. Ownership does not justify hidden access: administrative control is explicit, authenticated, revocable, and auditable.
