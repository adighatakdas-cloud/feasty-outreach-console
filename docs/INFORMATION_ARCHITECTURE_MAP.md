# Feasty Outreach Suite — information architecture and UI map

## Executive direction

The Feasty console should behave like an operations product, not an onboarding landing page. The permanent workspace should answer three questions immediately: what is happening, what requires attention, and which control should the operator use next. Setup guidance belongs in a first-run onboarding flow that appears after owner signup and can be reopened from Settings. It should not occupy the main dashboard after the workspace is configured.

The referenced Next Shadcn Dashboard Starter is useful for its separation of concerns: a compact shell, a functional overview, dedicated data-table pages, reusable form patterns, URL-synced table controls, and a command interface that learns from actual usage rather than showing a fixed catalogue of suggestions.[1] Feasty should borrow those interaction patterns without copying its product categories or visual identity.

## Global shell

### Sidebar

The sidebar is the persistent navigation model. It should communicate where the operator is, not repeat page descriptions. It will have three groups.

| Group | Items | Why it exists |
|---|---|---|
| Workspace | Overview, Research, Leads, Inbox | Daily operating surfaces |
| Operations | Accounts, Campaigns, Automations | Configure and run controlled work |
| Governance | Audit log, Settings | Traceability, connections, and policy |

The current nine-item flat list should become a grouped list with shorter labels. The active item will use the Feasty accent and a quiet elevated background. Icons remain Lucide only, with one consistent stroke treatment. The full wordmark will be replaced with a correctly cropped, high-contrast brand mark lockup; if the approved SVG remains visually unreliable, the sidebar should use the emblem plus sentence-case wordmark rendered as text rather than relying on an oversized whitespace-heavy SVG.

The bottom of the sidebar contains workspace identity, connection state, and the signed-in owner menu. Onboarding is not a permanent navigation item. It is available from the owner menu and Settings.

### Top bar

The top bar has four jobs and no decorative content.

1. It shows the current page title and location.
2. It shows the workspace health summary as compact text: `Healthy`, `Attention`, or `Offline`.
3. It provides one global search control.
4. It provides theme, help, and owner controls.

The current `Search workspace` control is visually weak and behaves like a generic button. It should become a proper global command trigger with a clear placeholder such as `Search workspace` and a keyboard hint. It must not show pre-populated suggestions. When opened, it starts empty. Results are generated only after the operator types. Once usage data exists, recently and frequently used destinations can be ranked after the query or displayed in a separate `Recent` section. No invented suggestions should appear in a fresh workspace.

The top bar should not repeat the full health strip. The current health strip belongs on Overview because it is an overview-specific operational summary. Other pages receive only a compact health indicator in the top bar.

## Overview page

### Purpose

Overview is the live operating dashboard. It is not a setup guide, product introduction, or list of generic statements.

### Primary content

The first viewport should contain:

- A compact header with the page title, date/window selector if analytics require it, and a single useful action such as `Refresh data`.
- Four real metric cards backed by the workspace snapshot: account health, active jobs, review queue, and open conversations.
- A time-bounded activity or throughput view using actual jobs, conversations, or campaign records. If there is insufficient data, show a factual empty state rather than a decorative chart.
- An attention queue containing failed jobs, paused accounts, blocked leads, and conversations awaiting a human response.
- A small campaign or queue status section showing active, paused, completed, and failed work.

The existing onboarding rail, `Move from setup to safe outreach`, system-guardrail prose, and generic quick-access statements should be removed from the permanent Overview. Their functional information should be redistributed into metric cards, attention rows, and a first-run onboarding flow.

### Next best action

`Next best action` remains only when there is an actual actionable condition. It should be a compact attention row or action card derived from data, not a permanent onboarding hero. Its priority is:

1. Failed or blocked work.
2. Paused or unhealthy accounts.
3. Conversations requiring a human response.
4. Leads waiting for qualification.
5. Campaigns needing approval.
6. No action required, with a factual healthy-state message.

If there is no actionable condition, the page should show `No action required` alongside current metrics. It should not tell a configured workspace to add its first account.

## Research page

Research is the controlled intake surface. It shows source configuration, the latest research run, candidate counts, and a review queue. The page explains the provenance of each candidate and whether the source basis is present. Its primary action is `Start dry research`, not an external send action.

The research results table should contain only fields needed for review: candidate identity, source, qualification state, audience signal, compliance state, and review action. Filters should be URL-synced so a refresh or shared link preserves the view.

## Leads page

Leads is the durable registry after research. It answers which candidates exist, how they were sourced, their qualification verdict, consent/source basis, and whether they are eligible for campaign use.

The table should be dense and inspector-like. It uses sticky headers, 40px rows, no zebra striping, monospace IDs and timestamps, hover-revealed row actions, and real pagination. Bulk actions should be explicit and limited to safe operations such as qualifying, excluding, or adding an opt-out record.

## Accounts page

Accounts is the sender and routing control plane. It shows account status, health, caps, working hours, connection mode, and network-route diagnostics. The page should prioritize account health and stop reasons over decorative profile cards.

The primary action is `Add account record`. Credential connection is a separate approved adapter flow. Each account row or card should expose the minimum required controls and a clear consequence statement before pause, revoke, or route changes.

## Campaigns page

Campaigns is the planning and approval surface. It shows campaign status, audience filters, assigned accounts, caps, variants, and approval state. A campaign cannot become active without passing the compliance and operator-approval gates.

The primary view should be a compact campaign table with a side panel or dialog for creation and editing. The page should not duplicate lead detail that already belongs in Leads.

## Inbox page

Inbox is the human-response surface. It shows conversation state, latest message, account, lead, sentiment or intent where available, and next required action. The primary layout is a two-pane inspector: conversation list on the left, selected thread on the right.

The page should make human handoff explicit. It should not present automation controls inside the conversation transcript unless they directly affect the selected thread.

## Automations page

Automations is the job-control and troubleshooting surface. It shows queue state, job type, target, account, attempt count, created time, failure reason, and controls such as retry, pause, or cancel.

Because job data can exceed two viewport lengths, the table should use a fixed-height scroll container with a sticky header and pagination. The page should provide filters for status, job type, account, and time range. It should show a compact summary row above the table rather than a long explanatory panel.

Every irreversible action includes one-line consequence text: `Cancelling removes this job from the queue and it will not resume automatically.`

## Audit log page

Audit log is the immutable governance view. It shows actor, timestamp, action, target, and details. Search and action filters are essential. The table should use a fixed-height scroll container, sticky headers, monospace timestamps and IDs, and pagination so it never becomes a page with more than two scrolls of raw rows.

## Settings page

Settings is the configuration center, not a catch-all page. It should use tabs or a left sub-navigation with four sections:

- Safety and autonomy.
- Connections and adapters.
- Conversation guide.
- Developer access.

Each section has one primary save action and an explicit before/after summary when values change. Secrets remain server-side. Destructive actions such as API-key revoke use a dedicated destructive button and consequence copy.

## Onboarding flow

Onboarding moves out of Overview. After the owner creates an account, the application opens a first-run checklist with four steps: workspace identity, approved adapter, sender account, and dry research. The checklist is stored as workspace progress and can be reopened from Settings. Completion should return the owner to Overview, where only current operational metrics remain.

The onboarding flow is the right place for setup explanations, not the daily dashboard.

## Search behavior

The global search trigger opens an empty command dialog. It has no static suggestions on first open. The operator must type before results appear. Results search page names, commands, account handles, lead identifiers, campaign names, job IDs, and audit actions when those records are available.

Search ranking should be deterministic:

1. Exact matches.
2. Prefix matches.
3. Recent destinations used by the current owner.
4. Frequently used destinations for the current workspace.
5. Fuzzy matches.

Usage signals must be stored as lightweight workspace preferences or derived from audit/navigation events. They must never create fake data or expose another workspace's usage.

## Dense-table rule

Leads, jobs, audit events, and conversations should never render an unbounded page of rows. Each has a fixed-height table viewport or server/client pagination, a sticky header, query/filter state, a visible result count, and keyboard-accessible row actions. When a table has more than approximately 25 rows, the operator should be able to continue working without scrolling through the entire page.

## Implementation sequence

1. Rework the global shell: sidebar groups, top bar, workspace health, brand lockup, and empty search dialog.
2. Replace Overview onboarding content with live metrics, attention queue, and data-backed activity.
3. Move onboarding into the owner signup/first-run flow.
4. Apply the dense-table container and pagination rules to Leads, Automations, Audit, and Inbox.
5. Propagate the same page-header and primary-action pattern to Research, Accounts, Campaigns, and Settings.
6. Verify every screen in light and dark themes, with keyboard navigation and empty/loading/error states.

## References

[1]: https://github.com/Kiranism/next-shadcn-dashboard-starter "Next Shadcn Dashboard Starter repository"
