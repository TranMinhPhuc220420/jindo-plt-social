# Design: Content reports

- Phase: 35
- Status: Implemented
- Related: ADR 0017, SRS Phase 35, PROGRESS 35.A–35.E

## Goal

Members can report live posts and comments. Admins work an `/admin/reports` queue.

## UX / pages

### Member

- Post `…` menu always visible when signed in. Author: Edit/Delete. Others: Report (approved posts only).
- Comments: Report next to Reply/Delete (not on own comment).
- Dialog: reason (`harassment`, `fraud`, `illegal`, `copyright`, `other`) + optional details. Toast: Report submitted.

### Admin `/admin/reports`

- Tabs: Open (default) | Reviewed | Dismissed | All
- Row: reporter, target preview, reason, details, created
- Actions: Dismiss; for posts Reject (uses moderation reason from report); for comments Delete; then mark reviewed

Dashboard card **Open reports**. Sidebar item Reports.

## Data & APIs

- `reports` table, morph `reportable` (Post, Comment)
- Unique `(reporter_id, reportable_type, reportable_id)`
- `POST /reports` `{ reportable_type, reportable_id, reason, details? }`
- `PATCH /admin/reports/{report}/dismiss`
- `PATCH /admin/reports/{report}/resolve` (reject post or delete comment)
- Audit `report.dismissed`, `report.resolved`

## Open questions

None for this pass. No DM reports.
