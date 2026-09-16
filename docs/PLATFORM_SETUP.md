# Feasty Production Platform Setup

## Current implementation status

The repository now targets **Railway PostgreSQL** through Drizzle's PostgreSQL dialect. The generated migration is in `drizzle-pg/0000_lowly_lady_deathstrike.sql`. It has been generated and type-checked, but it has **not been applied** because no Railway `DATABASE_URL` is available in this workspace.

The application keeps local authentication for preview and development. Clerk variables are scaffolded in `.env.example` for the production authentication cutover. The production cutover should happen after the Clerk instance and callback URLs exist; until then, the local fallback prevents the preview environment from becoming unusable.

## Plain-language setup

1. Create a Railway PostgreSQL service.
2. Copy Railway's connection string into `DATABASE_URL` in the Railway environment, never into source control.
3. Run `pnpm db:migrate:pg` once against the staging database.
4. Verify the migration with a health check and a sign-in smoke test.
5. Create a Clerk application.
6. Put the Clerk publishable key in `VITE_CLERK_PUBLISHABLE_KEY` and the secret in `CLERK_SECRET_KEY`.
7. Add the staging and production callback URLs in Clerk.
8. Map the Clerk owner email to the Feasty admin role.
9. Run the worker separately from the web process and give it the same `DATABASE_URL`.

## Learning Lab

The Learning Lab is a dedicated page in the Governance section. It exposes:

- Current learning stage
- Count of captured events
- Recommended next stage
- Minimum event threshold
- Whether approval is required
- Shadow, controlled-rollout, and active labels
- Explicit stage-save action

The stages are:

| Stage | Purpose |
|---|---|
| Capture outcomes | Collect labels without changing automation |
| Review labels | Inspect corrections and outcomes |
| Evaluate offline | Compare versions against a protected set |
| Shadow mode | Generate predictions without taking action |
| Controlled rollout | Use an approved version on a small slice |
| Approved active | Use the version with rollback controls |

The first version uses the number of recorded learning events as its readiness signal. Production should add evaluation-set accuracy, opt-out false-negative rate, interested-reply precision, and operator override rate before enabling active behavior.

## Notifications

Notifications remain adapter-based and configurable. The next production configuration should add Discord, email, signed webhook, and in-app delivery records. Each notification rule needs an event list, destination reference, quiet hours, retry policy, and delivery history.

## Browser runtime boundary

The browser-runtime interface can use persistent authorized profiles and operator handoff. A provider challenge must pause the account and notify the operator. The system must not use CAPTCHA solving, fingerprint spoofing, stealth plugins, proxy rotation for evasion, or provider-control bypassing.

## Railway commands

```bash
pnpm db:generate:pg
pnpm db:check:pg
pnpm db:migrate:pg
pnpm check
pnpm test -- --run
pnpm build
```

Never run `pnpm db:migrate:pg` against production until the staging migration, backup, rollback, and smoke test have completed.
