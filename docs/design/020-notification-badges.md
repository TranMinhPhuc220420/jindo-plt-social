# Design: Notification badge effectiveness (Phase 21)

- Phase: 21
- Status: Implemented
- Related: SRS Phase 21

## Source of truth

- `UnreadBadgesProvider` via persistent `UnreadBadgesLayout` (inside Inertia PageContext; shared across feed/messages/profile/settings).
- Seeds from Inertia `auth.unread_*` + `recent_notifications` (first mount only).
- **After mount:** Inertia visits (including prefetch) are **decrease-only** — stale `auth.unread_*` must not wipe live Firebase/Echo bumps or revive badges from history.
- Live **counts** (notifications) come from `UnreadBadgesUpdated` (`realtime/users/{id}/badges` / Echo `.unread.badges`).
- **Message badge** is the client sum of `realtime/users/{uid}/inbox/*/unread` (Phase 40). Inertia `auth.unread_messages_count` is always `0` and must not overwrite the inbox sum.
- Live **bell rows** come from the notification event; they do not increment the badge (dedupe by id).
- Opening a thread writes `inbox/{cid}.unread = 0` and `read/{self}.at` (no `POST /messages/{id}/read`).

## Mark-read

- Opening the bell dropdown or visiting `/notifications` marks **all** unread as read (badge → 0) and republishes the badge snapshot so other tabs/RTDB stay in sync.
- Index presents rows first, then marks read — first paint can still show “New” styling.
- Clicking a row navigates to its URL (no per-item mark needed after auto mark-all).

## Surfaces

Bell, left rail, mobile nav — same context counts; `bg-destructive`; `9+` cap; accessible names include unread count.

## Do / Don’t

- Do keep Reverb optional (SSR/Inertia refresh remains the fallback).
- Don’t add OS push or polling loops.
- Don’t trust history-restored `auth.unread_*` increases.
- Don’t point the Vite client at Firebase unless `BROADCAST_CONNECTION=firebase` (and Admin SDK + `VITE_FIREBASE_DATABASE_URL` are set).

## Manual QA (2 browsers, no reload)

1. Like / comment / follow / mention → bell + left rail + mobile badge +1; dropdown shows the item.
2. Send a DM while the peer is on the feed → message badge +1; open the thread → decreases; peer already in that thread → no increase.
3. Typing + inbound message in the open thread.
4. Hover-prefetch Home, then receive a like — badge must not snap back to 0.
5. Local: `BROADCAST_CONNECTION=reverb` (Firebase client off) and `BROADCAST_CONNECTION=firebase` with full `VITE_FIREBASE_*` (Echo off).
