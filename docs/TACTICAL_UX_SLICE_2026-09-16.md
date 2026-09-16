# Tactical UX Slice — Campaign Builder and Lead Detail

## Implemented

The Campaigns route now uses a six-step operator flow:

1. Audience
2. Qualification
3. Sequence
4. Capacity
5. Preview
6. Enroll and release

The builder includes a persistent readiness rail showing audience size, healthy account capacity, qualification mode, selected sequence, external-action state, and next best action. The flow calls the existing campaign create, dry-run preview, enrollment, and queue-admission procedures. It explicitly preserves the product boundary that external work is disabled in the current environment.

The draft library allows an operator to select an existing campaign and return to the builder. The preview step shows eligible/skipped totals and lead-level reasons. The final step separates enrollment preparation from queue-gate review.

The Leads table now has actionable primary record controls. Selecting a lead opens a nonmodal detail panel below the table containing qualification, contact state, follower count, capture date, bio/evidence, and the next operator action. The table remains visible so the operator can preserve comparison context.

## Browser acceptance

The Campaign Builder was opened from the Overview recommended path in My Browser. The six steps, readiness summary, external-work-disabled state, first-step form, draft library, and next-best-action guidance rendered correctly in preview mode.

The Lead Detail panel requires a populated authenticated workspace to validate its record-level state. The empty Leads state remains truthful and provides the import action.

## Verification

```text
pnpm check: passed
pnpm test -- --run: 40 passed across 12 files
pnpm build: passed
```

The frontend bundle-size warning remains non-failing and is tracked for code splitting.

## Next tactical slice

The next high-impact slice is Account Detail. It should convert the current account cards into a selected-account workspace with health history, queue capacity, cooldown/working-hours timeline, challenge state, route details, and recent actions. After that, Inbox should become the primary response-handling workspace.
