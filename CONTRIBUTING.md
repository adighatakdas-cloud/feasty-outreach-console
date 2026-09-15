# Contributing to Feasty Outreach Console

This repository is maintained as the source of truth for the internal Feasty operations console. The history should explain the product's progress to a human reader, not only to a build system.

## Branching

`main` is the verified release branch. Small, coherent changes may be committed directly during the active pilot. Larger changes should use a short-lived branch named after the outcome, such as `phase-2-campaign-enrollment` or `phase-3-dry-run-worker`.

## Commit style

Use a plain-language imperative subject with a conventional prefix:

- `feat:` for user-visible capability
- `fix:` for a defect correction
- `test:` for coverage or test-only work
- `docs:` for requirements, runbooks, and plans
- `chore:` for maintenance and tooling

Each commit should represent one understandable milestone. Avoid generated files, build output, dependency directories, credentials, cookies, browser profiles, or raw account sessions in Git.

## Required verification

Before pushing to `main`, run:

```bash
pnpm check
pnpm test
pnpm build
```

If a check cannot run because a required external service is not configured, record that limitation in the commit or pull request description. Do not replace real data with fabricated records to make a check pass.

## Security boundaries

Secrets belong in environment configuration or the selected secret manager. Instagram passwords and session cookies must remain inside the approved browser profile/runtime. The dashboard stores only references, health state, routing metadata, caps, and audit history.

Any account warning, CAPTCHA, rate limit, login challenge, or unexpected provider state must stop the affected account and leave an operator-visible record. Do not add CAPTCHA bypass, stealth fingerprinting, credential exfiltration, hidden owner paths, or covert telemetry.

## Release notes

When a milestone is pushed, describe what changed, what was verified, what remains blocked on credentials or infrastructure, and whether live external work is enabled. This keeps the GitHub history useful to the operator and future maintainers.
