# Realtime inventory (living)

Canonical list of **what must be real-time** in PLT Social. MySQL is the source of truth; Firebase Realtime Database (RTDB) is an **event bus** for UI only (see [ADR 0014](../decisions/0014-firebase-realtime-event-bus.md)).

When you add, change, or remove a realtime capability, **update this file in the same PR**.

## Principles

1. **MySQL wins** — never treat RTDB as durable business storage.
2. **Publish after commit** — write MySQL first; then broadcast (fail-soft: HTTP still succeeds if RTDB fails).
3. **Full UI payloads** — messages, notifications, and badge counts carry enough fields to update the UI without a refetch (same shapes as today’s Echo events).
4. **Dual driver** — local may use Reverb (`BROADCAST_CONNECTION=reverb`); cPanel production uses Firebase (`BROADCAST_CONNECTION=firebase`).
5. **Chat latency** — DM send uses JSON (`Accept: application/json`) + optimistic UI; `MessageSent` stays sync for the receiver; unread badge broadcast runs **afterResponse** (not on the send critical path).

## Inventory

| ID | Capability | Priority | Trigger (Laravel) | Echo channel / event | RTDB path | Payload | Frontend consumer | Status |
|----|------------|----------|-------------------|----------------------|-----------|---------|-------------------|--------|
| RT-MSG | Live DM in open thread | P0 | `MessageSent` via `MessageBroadcaster::publishSent` from `MessageController` (JSON 201) / share-to-DM | `private-conversation.{id}` / `.message.sent` | `realtime/conversations/{id}/events/message` | `id`, `conversation_id`, `body`, `image_url`, `shared_post`, `created_at`, `user{…}`, `origin_user_id` | Optimistic + JSON confirm (sender); `useConversationRealtime` (receiver) | Active |
| RT-BADGE-DM | Unread message badge | P0 | `UnreadBadgesUpdated` via `MessageBroadcaster::scheduleRecipientBadge` (**afterResponse**) + mark-read | `private-App.Models.User.{id}` / `.unread.badges` | `realtime/users/{userId}/badges` | `unread_messages_count`; optional `unread_notifications_count`, `conversation_id` | `UnreadBadgesProvider` | Active |
| RT-NOTIF | Notification badge + bell recent | P0 | `UserFollowedNotification`, `PostLikedNotification`, `CommentCreatedNotification`, `UserMentionedNotification`, `PostSharedNotification` (`database` + `broadcast`) | user channel / `.notification` | `realtime/users/{userId}/events/notification` | Notification `toArray()` + `type` + `origin_user_id` | `UnreadBadgesProvider` | Active |
| RT-TYPING | Typing indicator | P1 | Client RTDB write (preferred); HTTP `UserTyping` + `POST …/typing` fallback | whisper `typing` / `.user.typing` | `realtime/conversations/{id}/typing/{userId}` | `{ name, username?, at }` ephemeral (~4s TTL client-side) | `useConversationRealtime` | Active |
| RT-INBOX-PREVIEW | Inbox row preview while on messages UI | P1 | Derived from RT-MSG on client | (same as RT-MSG) | (same as RT-MSG) | Same as message payload | `messages/show` `bumpInboxPreview` | Active |
| RT-READ-SYNC | Badge sync after mark-read | P2 | HTTP mark-read → `UnreadBadgesUpdated` | (same as RT-BADGE-DM) | (same as RT-BADGE-DM) | Badge snapshot | `UnreadBadgesProvider` | Active |

### Supporting (authz, not a “feature event”)

| ID | Capability | Notes | Status |
|----|------------|-------|--------|
| RT-MEMBERS | Conversation member map | `realtime/conversations/{id}/members/{userId}: true` — written by Laravel Admin SDK when a DM conversation is created/updated; required by Security Rules | Active |

## Channel map (Echo → RTDB)

| Echo | RTDB |
|------|------|
| `private-App.Models.User.{userId}` + `.unread.badges` | `realtime/users/{userId}/badges` |
| `private-App.Models.User.{userId}` + notification | `realtime/users/{userId}/events/notification` (overwrite; each `set` is one event) |
| `private-conversation.{id}` + `.message.sent` | `realtime/conversations/{id}/events/message` (overwrite) |
| `private-conversation.{id}` + typing | `realtime/conversations/{id}/typing/{userId}` |

## Intentionally not realtime

| Topic | Why |
|-------|-----|
| Home feed / post cards | Poll / Inertia navigation; no live feed stream |
| Reactions on feed posts | Optimistic UI + reload; no WS fan-out |
| Online / offline presence | Out of scope |
| Sonner toasts | Inertia flash only (not Echo/Firebase) |
| FCM mobile push | Future phase if needed |

## How to update this inventory

1. Add/remove/change a row in **Inventory** (and channel map if paths change).
2. Update Firebase Security Rules ([`firebase/database.rules.json`](../../firebase/database.rules.json)).
3. Update `FirebaseBroadcaster` / publisher and frontend listeners (`resources/js/lib/realtime.ts` adapters).
4. Add or adjust Pest coverage (fail-soft broadcast).
5. Note ops impact in [`OPS_RUNBOOK.md`](../OPS_RUNBOOK.md) §5 if env/rules change.

## Related code

| Area | Path |
|------|------|
| Events | `app/Events/MessageSent.php`, `UnreadBadgesUpdated.php`, `UserTyping.php` |
| Message publish | `app/Services/Messaging/MessageBroadcaster.php`, `app/Support/MessagePresenter.php` |
| Notifications | `app/Notifications/*Notification.php` (five social types) |
| Channel auth (Reverb) | `routes/channels.php` |
| Echo client (local) | `resources/js/echo.ts` |
| Realtime abstraction | `resources/js/lib/realtime.ts` |
| Badge UI | `resources/js/components/notifications/unread-badges-provider.tsx` |
| DM thread | `resources/js/hooks/use-conversation-realtime.ts`, `resources/js/components/messages/message-composer.tsx` |
