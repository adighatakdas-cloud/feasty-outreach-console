# Feasty Outreach Suite API

## Base URL

Use the deployed workspace origin with the `/api/v1` prefix. The health endpoint is public; operational endpoints require a scoped bearer token.

## Authentication

```http
Authorization: Bearer fsty_live_<token>
```

API keys are created by an authenticated administrator from the Settings page. Only a SHA-256 hash and a short prefix are stored. The raw token is returned only on creation and should be stored in the calling service's secret manager.

Scopes:

| Scope | Allows |
|---|---|
| `read` | Read leads, campaigns, and sender-account records. |
| `write` | Queue controlled automation jobs. |

## Endpoints

### `GET /api/v1/health`

Returns a lightweight service check without credentials.

```json
{"service":"feasty-outreach-suite","version":"v1","status":"ok"}
```

### `GET /api/v1/leads?limit=100`

Requires `read`. Returns at most 200 live lead rows; the `limit` query parameter can reduce the response size.

### `GET /api/v1/campaigns`

Requires `read`. Returns campaign records and statuses.

### `GET /api/v1/accounts`

Requires `read`. Returns sender-account policy records. Secrets, cookies, sessions, and proxy credentials are never returned.

### `POST /api/v1/jobs`

Requires `write`. Queues a controlled job for the internal worker or operator-assist runtime.

```json
{
  "jobType": "connector_health",
  "adapterKey": "instagram",
  "accountId": 12,
  "payload": {"dryRun": true}
}
```

The endpoint returns `202 Accepted` with a job identifier. It does not execute browser automation inside the HTTP request and does not bypass review or account safety policy.

## Operational rules

Consumers should treat `401` as an invalid/revoked key, `400` as a malformed request, `503` as a database/service availability problem, and `202` as accepted rather than completed. Poll the workspace job record or add a notification rule for completion and failure. Never retry a CAPTCHA, account challenge, or rate-limit error without operator review.

The API is intentionally narrow. It is a control and data boundary for internal tools, not a public scraping or messaging API. Add new endpoints only with a scope, audit behavior, idempotency strategy, and rate-limit decision documented first.
