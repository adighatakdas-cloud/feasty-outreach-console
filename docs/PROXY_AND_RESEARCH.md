# Proxy and research operations

## Intended behavior

The suite treats network routing as part of account identity. Each sender account and the dedicated research account should have one stable route and one persisted browser profile. The route record stores only connection metadata and a server-side secret reference. The application can enable or disable a route, show its last health timestamp, and preserve the last error for troubleshooting.

The purpose is authorized connectivity, diagnostics, and isolation between accounts. It is not to disguise ownership, defeat platform enforcement, or make an account appear in multiple locations at once.

## What is implemented

- Stable route records with HTTP, HTTPS, or SOCKS5 protocol metadata.
- Per-account association and uniqueness constraint.
- Server-side `secretRef` rather than raw password storage.
- Enablement state, last health timestamp, and last error fields.
- Adapter configuration for a route health check.
- Research configuration that uses a dedicated source/job key.
- Stop-on-challenge language and operator-visible failure state.

## What is not implemented

- Automatic proxy rotation.
- Residential proxy procurement or provider management.
- CAPTCHA solving or CAPTCHA-service integration.
- Stealth fingerprints, browser impersonation, or challenge bypass.
- Multi-IP concurrent use of one sender account.
- Background browser execution inside the request-scoped WebDev process.

Those items require a separate security and platform-compliance review. In particular, automatic rotation conflicts with the requirement for stable account identity and session history.

## Research flow

1. Define keywords, hashtags, source, result ceiling, and review mode in Research.
2. Queue a `research_collect` job against the dedicated research adapter.
3. The worker runs the source adapter with conservative pacing and a stop condition for CAPTCHA, rate limits, login challenges, or unexpected navigation.
4. Persist only the collected profile fields and source metadata.
5. Run qualification review. AI can propose a verdict, but the configured operator policy determines whether approval is required.
6. Approved targets can be assigned to a paused campaign. No collection job sends outreach directly.

## Deployment requirement

A real browser worker, long-lived queue, reply webhook receiver, or near-real-time follow-up engine should run as a separate persistent service or a reserved worker process. The dashboard should enqueue durable jobs and display outcomes; it should not rely on an in-memory process surviving an HTTP request. The worker must use the same account profile and stable route for all actions belonging to that account.
