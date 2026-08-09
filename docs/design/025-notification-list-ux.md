# Design: Facebook-style notification list

- Status: Implemented
- Related: Phase 12 / 21 notification surfaces

## Goal

Bell dropdown and `/notifications` show actor avatar, bold name, action body, and relative time — Meta-like row layout.

## Payload

- Notification `toArray()` stores `body`, `actor_avatar`, `post_image` (when post-related), plus existing `message` / actor fields.
- `NotificationPresenter` batch-hydrates current `actor_avatar` / `post_image` when listing so older rows stay accurate.

## UI

- Shared `NotificationItem`: avatar + type badge, **name** + body, relative time (blue when unread), unread blue dot, optional post thumbnail on the right.
- Index groups **New** / **Earlier**; whole row click navigates.
- Opening the bell or visiting `/notifications` auto-marks all unread (badge clears). Index presents first, then marks, so “New” can still show on first paint.
