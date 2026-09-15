# Feasty Outreach Suite — operator guide

## 1. Sign in and workspace access

Open the workspace and sign in through the secure workspace login. A read-only preview is available before sign-in, but it does not load or mutate operational records. Once authenticated, the sidebar exposes the operational areas available to the current role.

Administrator-only actions include changing safety policy, adding or pausing accounts, configuring adapters and proxy routes, queuing jobs, reviewing targets, creating API keys, and changing campaign state. Every such action should be attributable to a named user and appear in the audit history.

## 2. Research suite

Use **Research** to define what the collection layer should look for. Enter comma-separated keywords or hashtags, choose an approved source, set a per-run result ceiling, and select whether AI review must be followed by operator approval. Save the rules before starting a run.

A research run is a collection job, not an outreach job. It must use a dedicated research account and stable network route. If a CAPTCHA, rate-limit response, login challenge, or unexpected account state appears, stop the run and review the account health record. Do not repeatedly retry the same blocked run.

Targets enter the review queue as `partial` until a review decision is recorded. Approve only targets that meet the current qualification rules. Rejected targets remain in the database with their decision rather than disappearing, so the team can understand source quality and improve filters.

## 3. Accounts and routes

Create an account record with a handle and human-readable label. Then set its cold cap, warm ceiling, working hours, and status. Pausing an account is the preferred response to uncertainty; disabling or deleting records should not be used as an operational shortcut.

A route is configured as a stable account property. Store the proxy host and port as routing metadata and reference credentials through a server-side secret reference. Do not paste passwords into notes, payloads, browser storage, or the lead database. Do not rotate a route during a session or move an account between routes without an explicit recovery procedure.

## 4. Campaigns and handoff

Create a draft campaign after the research queue contains reviewed targets. Define inclusion and exclusion filters, follower range, account assignment, message templates, follow-up policy, and any experiment variants. Keep the campaign paused until the first dry run is reviewed.

A lead should move through a visible chain: collected, reviewed, assigned, queued, contacted, replied, interested, booked, or stopped. Operator takeover must win over automated follow-up, and a takeover should stop pending automated actions for the conversation.

## 5. Automations and troubleshooting

The Automations area is the first place to look when something does not progress. Inspect job type, adapter, status, attempts, error code, and error text. Retry only after correcting the underlying condition. Pause a job when the correct next action is unknown; cancel it when the run is no longer valid.

The intended failure sequence is: record the error, classify it, pause or cooldown the affected account when appropriate, notify the operator, and only then decide whether to retry. CAPTCHA and rate-limit signals are stop conditions.

## 6. Settings

The primary Settings controls use plain language. Safety policy controls whether operator approval is required, how many times a task may retry, and when repeated failures trigger a pause. The conversation guide defines tone, qualification behavior, and human handoff conditions.

The **Advanced troubleshooting** disclosure exposes the raw JSON representation for maintainers. It is not the normal configuration path. Use it only when a documented setting cannot express the required value, and record the reason in the change note or incident record.

## 7. External API keys

Use **Settings → Developer access** to create a scoped key. Give it a specific name such as `crm-sync-readonly` and grant only the required scopes. The full key is displayed once. Copy it into the consuming server's secret manager immediately; it cannot be recovered from the Feasty database.

Revoke a key as soon as its consumer is retired or compromised. Prefer separate keys per system rather than sharing one broad key. Never place a key in frontend JavaScript, a browser extension bundle, a public repository, or a support ticket.
