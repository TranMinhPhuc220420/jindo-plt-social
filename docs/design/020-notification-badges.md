# Design: Notification badge effectiveness (Phase 21)

- Phase: 21
- Status: Implemented
- Related: SRS Phase 21

## Source of truth

- `UnreadBadgesProvider` via persistent `UnreadBadgesLayout` (inside Inertia PageContext; shared across feed/messages/profile/settings).
- Seeds from Inertia `auth.unread_*` + `recent_notifications`.
- **Network visits** (`success` + non-cached `navigate`): full replace from shared props (clears Echo bumps after opening a thread).
- **Prefetch / history**: decrease-only — stale cached `auth.unread_*` must not revive badges.
- `messages/show` pins badge via `setMessages(auth.unread_messages_count)` + `router.flushAll()`.
- Echo `.notification` / `.unread.badges` update live counts.
- While `messages/show` is focused, live badge **increases** for that `conversation_id` are ignored; inbound messages call `POST /messages/{id}/read` so the DB stays clean.

## Mark-read

- Opening the bell dropdown or visiting `/notifications` marks **all** unread as read (badge → 0).
- Index presents rows first, then marks read — first paint can still show “New” styling.
- Clicking a row navigates to its URL (no per-item mark needed after auto mark-all).

## Surfaces

Bell, left rail, mobile nav — same context counts; `bg-destructive`; `9+` cap; accessible names include unread count.

## Do / Don’t

- Do keep Reverb optional (SSR/Inertia refresh remains the fallback).
- Don’t add OS push or polling loops.
- Don’t trust history-restored `auth.unread_*` increases.
