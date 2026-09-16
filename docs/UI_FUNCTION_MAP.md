# Feasty Outreach Suite — complete UI and function map

## Product rule

Every visible element in Feasty must answer one question: **what operator decision or system state does this help expose or control?** The console is not a marketing page. It is an operations surface for configuring accounts, discovering leads, reviewing candidates, preparing campaigns, monitoring jobs, handling conversations, and preserving an audit trail.

The UI therefore uses a deliberate hierarchy:

1. The shell exposes location, workspace identity, security state, and global access.
2. Overview exposes the current operating state and the next real action.
3. Specialist pages expose one operational job at a time.
4. Tables expose durable records with filtering and bounded scrolling.
5. Forms change configuration through explicit, auditable mutations.
6. Empty, loading, error, paused, and healthy states explain the actual condition rather than inventing demo content.

## 1. Global application shell

### 1.1 Sidebar brand lockup

The sidebar brand is the Feasty identity and workspace anchor. It is not a decorative hero image. The orange approved Feasty lockup is used in light mode, and the white monochrome lockup is used in dark mode. The lockup is deliberately placed in the sidebar because the operator needs a stable visual origin while moving between operational screens.

**Function:** reinforces application identity, confirms the active workspace context, and provides a theme-aware contrast treatment. It has no backend mutation.

### 1.2 Workspace identity block

The workspace identity block contains the `OUTREACH SUITE` label and either the authenticated owner/workspace name or `Owner setup required`.

**Function:** distinguishes the current workspace from the individual page. The unauthenticated state is meaningful because it tells the user why live records are absent. It should never say `Preview`, because Preview suggests fabricated demo data rather than an actual authentication boundary.

### 1.3 Grouped sidebar navigation

| Group | Page | Operational function |
|---|---|---|
| Workspace | Overview | Understand current operating state |
| Workspace | Research | Collect and review candidates from approved sources |
| Workspace | Leads | Search and qualify durable lead records |
| Workspace | Inbox | Handle conversations and human handoff |
| Operations | Accounts | Configure senders, caps, routes, and health |
| Operations | Campaigns | Create and prepare controlled outreach work |
| Operations | Automations | Queue, inspect, retry, pause, and cancel jobs |
| Governance | Audit log | Search privileged changes and actor history |
| Governance | Settings | Configure safety, adapters, conversation behavior, and API access |

The grouping exists because the operator has three different mental modes. Workspace pages answer what is happening. Operations pages change what the system will do. Governance pages control permissions, connections, and traceability.

The current page receives an accent treatment so the operator can identify location without reading a breadcrumb trail. Automations receives an alert marker when failed jobs are present because failure discovery is time-sensitive.

### 1.4 Sidebar security badge

The `Failsafes enabled` badge communicates that external work requires explicit controls. It is intentionally static until a richer aggregate health model exists.

**Function:** gives the operator a persistent safety affordance. It should not claim that all adapters or accounts are healthy. Detailed health belongs in the status strip and Accounts page.

### 1.5 Owner row

The owner row contains the owner initial, owner name, authentication state, and sign-in or logout action.

**Function:** makes the session boundary visible. The logout action terminates the local session. The sign-in action opens the owner authentication flow. This row is also the correct future home for profile, workspace switching, and onboarding access.

### 1.6 Mobile sidebar control

On narrow screens, the sidebar becomes an off-canvas navigation panel. The menu button opens it and the close button dismisses it.

**Function:** preserves all navigation without permanently consuming mobile width. The interaction must remain keyboard accessible and must close after navigation.

## 2. Top bar

### 2.1 Page title and icon

The top bar shows the active page icon and label. It does not repeat the longer page description.

**Function:** provides immediate location context while the sidebar may be collapsed or out of view.

### 2.2 Workspace runtime status

The top-right status uses meaningful operational language:

- `Workspace live` means the owner session is active and live workspace data can be requested.
- `Owner setup required` means the application is waiting for an owner session before showing live records.

This is intentionally not `Connected` or `Not connected` because those phrases do not say what is missing or what is working.

**Function:** exposes the authentication/data boundary without pretending that authentication implies every adapter is healthy. Adapter health belongs in the status strip.

### 2.3 Profile marker

The profile marker shows the authenticated owner initial when available. It is a compact recognition element and future profile-menu trigger.

**Function:** confirms who is operating the workspace. It should not become a second navigation system.

## 3. Global status and boundary states

### 3.1 Workspace status strip

The status strip contains three clickable summaries:

| Segment | Data | Destination | Why it exists |
|---|---|---|---|
| Account health | Healthy and attention account counts | Accounts | Detect sender risk quickly |
| Job queue | Queued/running and failed counts | Automations | Detect active or failed work |
| Adapter readiness | Enabled adapters out of catalog | Settings | Detect missing connection configuration |

The strip is always visible on authenticated pages because these states can affect any operation. Each segment navigates to the page where the operator can resolve the state.

### 3.2 Owner setup banner

When no owner is authenticated, the banner says that an owner account is needed to load live workspace data and provides the sign-in action.

**Function:** explains the empty-data state and offers the only relevant next action. It must not fabricate records merely to make the interface look populated.

### 3.3 Error banner

When the workspace snapshot fails for an authenticated user, the error banner shows the failure message and a retry action.

**Function:** distinguishes a backend/data failure from an empty workspace. Retry is a reversible recovery action. The error should not be hidden inside a toast because the condition affects the entire page.

### 3.4 Loading state

The loading skeleton is used while workspace data is being fetched. It indicates structural content without inventing values.

**Function:** prevents layout shift and communicates that the system is working. It should appear only during a real loading state.

## 4. Floating Quick Access

Quick Access is a global utility, not a primary navigation replacement.

### 4.1 Trigger

The command-center icon sits in a bounded floating control. It opens the utility actions on hover and focus. The trigger uses a grab cursor because it is draggable.

### 4.2 Three utility actions

1. **Search workspace:** opens the command palette.
2. **Toggle theme:** switches between the approved light and dark visual systems.
3. **Open Settings:** jumps to the configuration center.

These are high-frequency global utilities and therefore belong in a floating control rather than taking permanent top-bar space.

### 4.3 Drag behavior

The control can be dragged within viewport bounds. Its x and y coordinates are clamped so it cannot leave the right, left, top, or bottom edge. Pointer capture and a grab cursor make the interaction understandable.

A double-click or double-tap returns it to its default lower-right anchor. The return uses an eased left/top transition rather than removing the inline position immediately, which prevents teleportation.

The floating control should remain a utility. It must not become a movable decoration that blocks tables or primary actions.

## 5. Command palette and search

The command palette is a global search surface for pages and, progressively, workspace records.

### 5.1 Empty-first behavior

A new workspace opens the palette with no suggestions. It asks the operator to type. This prevents fabricated recommendations and removes the appearance of a hard-coded demo catalogue.

### 5.2 Recent destinations

After the operator has used pages, recent destinations may appear. They are derived from actual navigation in the current browser/workspace context.

### 5.3 Search results

The target search model is:

- Page names and descriptions.
- Account handles and labels.
- Lead handles, names, and IDs.
- Campaign names.
- Job IDs and types.
- Audit actions and targets.

Results should rank exact matches before prefix, recent, frequent, and fuzzy matches. Search results must respect workspace ownership and must never expose another workspace's records.

## 6. Shared visual and interaction primitives

### 6.1 PageHeader

Every page header contains an eyebrow, title, description, and optional action.

**Function:** states the purpose of the page and presents one primary action without duplicating page content. The eyebrow identifies the operational domain; the title identifies the job; the description explains the consequence or scope.

### 6.2 Panel

Panels group related controls or records into one decision area.

**Function:** creates a visual boundary around a coherent task. Panels should not be used merely to decorate every paragraph. A panel should contain a form, a summary, a table, or a meaningful state.

### 6.3 PanelHeader

Panel headers contain a small contextual label, a title, and optional status/action.

**Function:** provides hierarchy inside a page and keeps actions next to the content they affect.

### 6.4 StatusPill

The status pill maps known values to semantic tones:

- Green: healthy, succeeded, connected, active, running.
- Yellow: degraded, warming, queued, paused.
- Red: failed, blocked, cancelled.
- Gray: unknown or not configured.

**Function:** gives the operator fast state recognition without forcing them to interpret prose. It must not be used as decoration or for arbitrary marketing labels.

### 6.5 EmptyState

Empty states contain an icon, a factual title, an explanation, and optionally one relevant action.

**Function:** distinguishes “there are no records” from “data failed to load” and gives the next safe action. Empty states must never present fake sample records.

### 6.6 Metric card

Metric cards are clickable summaries that lead to the page where the metric can be acted upon.

**Function:** compresses high-value operational counts into the Overview first viewport. A metric is valid only when it comes from the workspace snapshot or a clearly stated derived count.

### 6.7 Row and data summary

Rows show a label, value, optional detail, and semantic tone.

**Function:** represent compact configuration or health facts without creating a full table. They are appropriate for workload summaries, security facts, and safety settings.

### 6.8 Toast notification

Toasts confirm reversible or completed actions such as saving a configuration or queuing a job. Important data-loading errors remain inline.

**Function:** provides short action feedback without interrupting workflow. Destructive actions still require consequence copy and confirmation where applicable.

## 7. Overview page

### Purpose

Overview is the live operations dashboard. It is not onboarding and does not explain the product in generic language.

### 7.1 Overview header

The header says `Overview` and describes live operating state. The action opens Research unless failed jobs require immediate review, in which case it opens Automations.

**Function:** provides a context-sensitive starting action.

### 7.2 Metric grid

| Metric | Source | Destination | Decision supported |
|---|---|---|---|
| Healthy accounts | Accounts filtered by health | Accounts | Can senders safely operate? |
| Active jobs | Queued/running jobs | Automations | Is work currently running? |
| Leads to review | Partial qualification verdicts | Leads | Is the review queue blocked? |
| Open conversations | Human/open/waiting conversation states | Inbox | Does an operator need to respond? |

### 7.3 Attention panel

The attention panel ranks failed jobs, paused accounts, waiting human responses, and partial leads. Each row links to its resolving page.

**Function:** replaces a generic “next best action” story with a data-derived intervention queue. If no intervention exists, it says `No action required`.

### 7.4 Operational summary

The summary shows active campaigns, connected adapters, and queue state.

**Function:** gives a compact cross-domain view without duplicating full tables.

### 7.5 Recent jobs

The recent jobs list shows the latest six jobs with timestamp, type, status, and a link to Automations.

**Function:** provides temporal context. It is intentionally short; the full record set belongs on Automations.

## 8. Accounts page

### Purpose

Accounts is the sender and routing control plane.

### 8.1 Add account form

The form accepts a handle and label.

**Backend function:** calls `accounts.create`. It creates an account record without storing credentials in the browser.

### 8.2 Account cards

Each account shows handle, label, health status, cold cap, warm ceiling, and working hours.

**Backend function:** editable fields call `accounts.update`. These values control account ramp and operating policy.

### 8.3 Health callout

Shows the last successful action or a factual “no successful action recorded” state.

**Function:** gives a direct health signal without interpreting absence as failure.

### 8.4 Stable network route

The expandable route editor accepts label, protocol, host, port, and secret reference.

**Backend function:** calls `proxies.save`. The route is associated with one account and remains stable until intentionally changed.

### 8.5 Pause/resume and dry run

Pause/resume changes the account status through `accounts.update`. Dry run points the operator to Automations for a health-check job.

**Function:** separates reversible account control from actual external work.

## 9. Research page

### Purpose

Research is the approved-source candidate collection and review surface.

### 9.1 Collection rules

The form controls keywords, source, maximum results, and review mode.

**Backend functions:** `config.saveSection` stores rules. `jobs.enqueue` creates a `research_collect` job.

### 9.2 Run research action

Queues a research job; it does not directly message targets.

**Function:** preserves the separation between discovery and outreach.

### 9.3 Pipeline summary

The collect-review-handoff sequence explains why research records do not immediately enter a campaign.

**Function:** communicates the control boundary between source collection, qualification, and approved outreach.

### 9.4 Review queue

The table shows target, source, fit verdict, and approve/reject actions.

**Backend function:** review actions call `leads.review`.

### 9.5 Run history

Shows research and source-sync jobs plus feedback-event count.

**Function:** connects current review work to previous collection runs.

## 10. Leads page

### Purpose

Leads is the durable registry of candidates that can later be used by campaigns.

### 10.1 Search and qualification filter

Search filters by handle, display name, or source. Qualification filters restrict the verdict. Pagination shows 12 records at a time.

**Function:** supports review without unbounded scrolling. Query state should eventually be synchronized to the URL so filtered views can be revisited.

### 10.2 Lead registry table

The table contains the fields needed to decide whether a lead is eligible: identity, source, qualification, and compliance state.

**Function:** preserves a single source of truth for candidate readiness. It should not duplicate conversation content or campaign configuration.

### 10.3 Pagination

Pagination prevents a large registry from becoming an unbounded page.

## 11. Campaigns page

### Purpose

Campaigns is the planning and approval surface for outreach sequences.

### 11.1 Create draft form

The form creates a campaign name.

**Backend function:** calls `campaigns.create`.

### 11.2 Campaign table

Shows name, status, created time, and updated time.

**Function:** makes campaign lifecycle visible. Later campaign detail should contain lead filters, account assignment, caps, variants, and approval state rather than expanding the main table indefinitely.

## 12. Inbox page

### Purpose

Inbox is the human-response and handoff surface.

### 12.1 Conversation table

Shows lead, conversation state, state source, and last activity.

**Function:** identifies conversations that need human attention and distinguishes automated state from operator state.

### 12.2 Empty inbox state

Explains that messages appear only after an approved messaging adapter is connected.

**Function:** makes the adapter dependency visible without fabricating threads.

### Future architecture

As conversation records become available, Inbox should become a two-pane list/detail view: conversation list on the left and selected transcript plus handoff controls on the right. The table should remain bounded and filterable.

## 13. Automations page

### Purpose

Automations is the job queue and troubleshooting control plane.

### 13.1 Queue job form

Allows an operator to select a job type and enqueue it.

**Backend function:** calls `jobs.enqueue`.

### 13.2 Job table

Shows job type, adapter, status, attempt count, error, and controls.

**Function:** gives operators enough information to decide whether to retry, pause, resume, or cancel.

### 13.3 Job controls

Retry, pause/resume, and cancel call `jobs.control`.

**Safety rule:** cancel and pause actions must include one-line consequence copy and should receive confirmation where the change is difficult to reverse.

### 13.4 Failsafe summary

Shows pause-on-failure, retry policy, and kill-switch availability.

**Function:** exposes the operating policy without requiring an operator to inspect code or raw configuration.

### 13.5 Diagnosis panel

Lists adapter health, account health, and job payload as the recommended diagnostic order.

**Function:** reduces troubleshooting time by guiding operators from external dependency to local account state to job details.

## 14. Audit log page

### Purpose

Audit log is the governance record for privileged workspace changes.

### 14.1 Search and action filter

Search matches action, target, ID, and serialized details. The action select narrows the event type.

### 14.2 Append-only table

Shows time, action, target, actor, and details. It is paginated at 15 rows per page and uses a bounded table panel.

**Function:** supports incident review, compliance inspection, and accountability. It should not provide editing controls.

## 15. Settings page

### Purpose

Settings is a focused configuration center. It now exposes one configuration job at a time through four tabs.

### 15.1 Safety tab

Controls approval requirement, autonomy level, retry count, and failure cooldown.

**Backend function:** calls `config.saveSection` with the `safety` section.

The advanced payload is hidden behind an explicit control because raw configuration is useful for maintainers but harmful as the primary experience.

### 15.2 Connections tab

Shows each approved adapter and its current mode. The operator can select disabled, official API, or operator-assisted mode where supported.

**Backend function:** calls `adapters.upsert`.

The page explains that credentials remain authorized and server-side. It does not offer covert access, CAPTCHA solving, stealth fingerprinting, or credential storage in client state.

### 15.3 Conversation tab

The conversation guide is a text configuration for tone, goals, and human handoff.

**Backend function:** calls `owner.savePrompt`.

The operator lock is shown because the conversation guide cannot override safety controls.

### 15.4 Developer tab

Contains the API access panel.

**Backend functions:** lists clients, creates scoped API keys, and revokes keys. Keys are shown once and are not stored in plain text.

## 16. Authentication panel

### Purpose

The auth panel handles the local owner boundary while Clerk integration is not yet connected.

### Functions

- Check whether local auth is configured.
- Create the first owner account.
- Sign in locally.
- Sign out through the owner row.
- Reload the workspace after successful authentication.

The panel explains that passwords are salted scrypt hashes and sessions are secure HTTP-only cookies. When Clerk is introduced, this panel should become the integration seam rather than requiring page-wide changes.

## 17. Visual states and their meaning

| State | Meaning | Required UI response |
|---|---|---|
| Loading | A request is in progress | Skeleton structure, no invented values |
| Empty | Request succeeded but no records exist | Factual empty state and one safe next action |
| Healthy | Records exist and no intervention is required | Green/neutral status and normal controls |
| Attention | A record needs operator review | Amber status, direct link to resolving page |
| Failed | A job or dependency failed | Red status, error reason, retry/diagnosis action |
| Paused | Work was intentionally stopped or cooldown was triggered | Yellow status, resume/review action |
| Unauthenticated | Owner identity is not present | Owner setup message, no live records |
| Forbidden/error | Request failed or access is unavailable | Inline error with retry or support path |

## 18. UI elements that should not return

The following patterns are intentionally excluded from the architecture:

- Permanent onboarding rails on Overview.
- Generic motivational statements without a backend value.
- Fake demo records in an unauthenticated workspace.
- Long unbounded tables.
- A flat sidebar with no domain grouping.
- A top bar overloaded with search, theme, status, and page descriptions.
- Raw JSON as the primary Settings experience.
- Decorative cards that do not navigate or change a record.
- Vague labels such as `Preview`, `Not connected`, or `Something went wrong` when a more specific state is available.

## 19. Recommended next UI work

The current architecture is ready for the next page-level pass. The highest-value work is to make Leads, Inbox, Automations, and Audit Log share a common dense-table component with URL-synced filters, keyboard row actions, and consistent pagination. The next major product flow is first-run onboarding after owner creation, separate from Overview and reopenable from the owner menu.

## References

[1]: https://github.com/Kiranism/next-shadcn-dashboard-starter "Next Shadcn Dashboard Starter repository"
