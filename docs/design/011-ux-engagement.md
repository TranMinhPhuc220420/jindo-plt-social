# Design: Engagement (Phase 12)

- Phase: 12
- Status: Implemented
- Related: SRS §18, PROGRESS 12.A–12.F

## Goal

Polish post detail, comments, notifications, bookmarks.

## UX / pages

### Post show

- Back to previous/feed link
- PostCard + comments section below
- Comment composer sticky-ish at bottom of thread area

### Comments

- Parent comment; replies indented one level
- Reply affordance; delete with confirm

### Notifications

- Bell (top bar): show SSR `recent` + unread count; Echo increments; Mark all; View all
- Prefer bell as primary; left-rail Notifications still OK for full page
- Index: unread background; Mark read; EmptyState

### Bookmarks

- Same PostCard density; EmptyState CTA “Browse feed”

## Data & APIs

If bell has no recent payload today, share recent notifications via Inertia middleware/props (document in impl).
