# Realtime inventory (living)

Canonical list of **what must be real-time** in PLT Học Bá. MySQL is the source of truth for users, follows, posts, and notifications. **1:1 DMs are durable on Firebase RTDB** ([ADR 0020](../decisions/0020-firebase-durable-dms.md)). Badges (notifications) and typing remain an event bus ([ADR 0014](../decisions/0014-firebase-realtime-event-bus.md)).

When you add, change, or remove a realtime capability, **update this file in the same PR**.

## Principles

1. **MySQL wins for community data** — users, follows, posts, reports. **RTDB wins for 1:1 chat** (inbox, thread, unread, last_message).
2. **Client owns DM nodes** — the JS SDK writes `messages/*`, `last_message`, `read/{uid}`, and `users/{uid}/inbox/{cid}`. Laravel Admin SDK writes **`members/{uid}` only** (ensure). It does not persist chat in MySQL.
3. **Full UI payloads** — messages, notifications, and badge counts carry enough fields to update the UI without a refetch.
4. **Dual driver for non-DM** — local may use Reverb (`BROADCAST_CONNECTION=reverb`) for notifications/badges; cPanel uses Firebase. **Chat always needs `VITE_FIREBASE_*`** (even locally). The frontend subscribes to notification badges using Inertia `realtime.driver`.
5. **Chat latency** — text DMs: client RTDB write + optimistic UI; receiver `onChildAdded`. Images: upload then RTDB. No Echo `.message.sent` for DMs.
6. **Badge snapshot** — `UnreadBadgesUpdated` carries notification unread (message count is `0` on the server). Message badge is the client sum of `inbox/*/unread`.

## Inventory

| ID | Capability | Priority | Trigger (Laravel) | Echo channel / event | RTDB path | Payload | Frontend consumer | Status |
|----|------------|----------|-------------------|----------------------|-----------|---------|-------------------|--------|
| RT-MSG | Live DM in open thread | P0 | Client JS SDK write. Laravel: ensure members + media upload only | (none for DMs) | `realtime/conversations/{minUid}_{maxUid}/messages/{pushId}` + `last_message` | `client_id`, `conversation_id` (string), `body`, `image_url`, `shared_post`, `created_at`, `at`, `user{…}` | Optimistic + `useConversationRealtime` `onChildAdded` | Active |
| RT-INBOX | Inbox list + DM unread | P0 | Client write on send / mark-read | (none) | `realtime/users/{uid}/inbox/{cid}` | `peer`, `last_message`, `unread`, `updated_at` | Inbox pages + `UnreadBadgesProvider` (sum) | Active |
| RT-READ | Read receipts | P1 | Client write on thread open | (none) | `realtime/conversations/{cid}/read/{uid}` | `{ at }` | Thread “Seen” when `peer.at >= message.at` | Active |
| RT-BADGE-DM | Unread message badge | P0 | Client inbox sum (not Laravel) | — | `realtime/users/{userId}/inbox/*/unread` | number | `UnreadBadgesProvider` | Active |
| RT-NOTIF | Notification badge + bell recent | P0 | `NotificationSent` (database channel) → `UnreadBadgeBroadcaster`; notification `broadcast` → event overwrite | user channel / `.unread.badges` + `.notification` | `realtime/users/{userId}/badges` + `…/events/notification` | Badge snapshot (`unread_messages_count` unused / 0); notification `toArray()` + semantic `type` + `at` | `UnreadBadgesProvider` | Active |
| RT-TYPING | Typing indicator | P1 | Client RTDB write (preferred); HTTP `UserTyping` + `POST …/typing` fallback | whisper `typing` / `.user.typing` | `realtime/conversations/{cid}/typing/{userId}` | `{ name, username?, at }` ephemeral (~4s TTL client-side) | `useConversationRealtime` | Active |
| RT-INBOX-PREVIEW | Inbox row preview while on messages UI | P1 | Same as RT-INBOX | (none) | (same as RT-INBOX) | Same as inbox payload | `useInbox` | Active |

### Supporting (authz, not a “feature event”)

| ID | Capability | Notes | Status |
|----|------------|-------|--------|
| RT-MEMBERS | Conversation member map | `realtime/conversations/{cid}/members/{userId}: true` — written by Laravel Admin SDK on `POST /messages/ensure` (and thread open). Required by Security Rules. Clients cannot write `members`. | Active |

## Channel map (Echo → RTDB)

| Echo | RTDB |
|------|------|
| `private-App.Models.User.{userId}` + `.unread.badges` | `realtime/users/{userId}/badges` (notifications only) |
| `private-App.Models.User.{userId}` + notification | `realtime/users/{userId}/events/notification` (overwrite; each `set` is one event) |
| `private-conversation.{id}` + `.message.sent` | **Retired for DMs.** Client writes `realtime/conversations/{cid}/messages/{pushId}` + `last_message` + inbox |
| `private-conversation.{id}` + typing | `realtime/conversations/{cid}/typing/{userId}` |

## Intentionally not realtime

| Topic | Why |
|-------|-----|
| Home feed / post cards | Poll / Inertia navigation; no live feed stream |
| Reactions on feed posts | Optimistic UI + reload; no WS fan-out |
| Online / offline presence | Out of scope |
| Sonner toasts | Inertia flash only (not Echo/Firebase) |
| FCM mobile push | Future phase if needed |
| Server-side DM search | Chat is not in MySQL |

## How to update this inventory

1. Add/remove/change a row in **Inventory** (and channel map if paths change).
2. Update Firebase Security Rules ([`firebase/database.rules.json`](../../firebase/database.rules.json)).
3. Update `FirebaseBroadcaster` / publisher and frontend listeners (`resources/js/lib/realtime.ts` adapters).
4. Add or adjust Pest coverage (ensure / media / fail-soft).
5. Note ops impact in [`OPS_RUNBOOK.md`](../OPS_RUNBOOK.md) §5 if env/rules change.

## Related code

| Area | Path |
|------|------|
| Events | `UnreadBadgesUpdated.php`, `UserTyping.php` |
| Badge publish | `app/Services/UnreadBadgeBroadcaster.php`, `app/Listeners/BroadcastUnreadBadgesOnNotification.php` |
| DM gate | `app/Http/Controllers/ConversationController.php`, `app/Services/ConversationService.php`, `app/Support/ConversationId.php` |
| Members | `app/Services/Firebase/ConversationMemberSync.php` |
| Notifications | `app/Notifications/*Notification.php` (social types + `KeepsSemanticBroadcastType`) |
| Channel auth (Reverb typing) | `routes/channels.php` |
| Echo client (local, non-DM) | `resources/js/echo.ts` |
| Realtime abstraction | `resources/js/lib/realtime.ts` |
| Badge UI | `resources/js/components/notifications/unread-badges-provider.tsx` |
| DM thread | `resources/js/hooks/use-conversation-realtime.ts`, `resources/js/components/messages/message-composer.tsx` |
