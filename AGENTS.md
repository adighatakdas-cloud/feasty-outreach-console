# Feasty implementation instructions

Before changing this repository, read `docs/IMPLEMENTATION_MEMORY.md`. It is the authoritative build-phase and architecture record.

The immediate goal is a safe two-account pilot. Build the functional core before external provider execution: lead intake, qualification, compliance, campaign preview, dry-run queue, audit, inbox, alerts, reports, and learning capture.

Never implement CAPTCHA solving, fingerprint spoofing, stealth automation, provider-safeguard evasion, credential exfiltration, hidden access, or covert telemetry. Provider warnings, rate limits, CAPTCHA, login challenges, and unexpected states must pause the affected account and create an operator-visible record.

After each milestone run:

```bash
pnpm check
pnpm test -- --run
pnpm build
```

Do not commit credentials, cookies, browser profiles, raw account sessions, `node_modules`, `dist`, or large media assets.
