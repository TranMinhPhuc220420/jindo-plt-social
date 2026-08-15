# Design: Post moderation queue

- Phase: 32
- Status: Implemented
- Related: SRS Phase 32, ADR 0016, PROGRESS 32.A–32.G

## Goal

Member posts go live only after an admin approves them. `/admin/posts` is a review queue with enough content (author, body, media, share embed) to decide quickly.

## UX / pages

### Author

- Compose/share toast: “Submitted for review.” (admin compose stays “Post created.” / “Post shared.”)
- Own pending/rejected posts appear on home feed and own profile with a badge
- Rejected: show the admin reason; Edit resubmits as pending
- Like / comment / share / bookmark hidden until approved

### Admin `/admin/posts`

- Tabs: Pending (default) | Approved | Rejected | All; keep `?q=`
- Row: avatar + name + `@username`; full body (`line-clamp-6`); media thumbs; share snippet; status; created/updated; Approve, Reject (dialog + required reason), Delete, Open
- Dashboard card **Pending posts** → `/admin/posts?status=pending`

## Data & APIs

- `posts.moderation_status` (`pending` | `approved` | `rejected`), `moderation_reason`, `reviewed_at`, `reviewed_by`
- `PATCH /admin/posts/{post}/approve`
- `PATCH /admin/posts/{post}/reject` body `{ reason }` (required, max 500)
- Audit: `post.approved`, `post.rejected`, `post.deleted`
- Public queries: `approved()`. Author lists: `visibleTo($viewer)` (approved or own)

## Open questions

None for this pass.
