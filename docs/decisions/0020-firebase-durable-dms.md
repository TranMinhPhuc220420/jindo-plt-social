# ADR 0020: Firebase RTDB is the durable store for 1:1 DMs

- Status: Accepted
- Date: 2026-08-15
- Amends: [ADR 0014](./0014-firebase-realtime-event-bus.md), [ADR 0019](./0019-firebase-live-dm-cache.md), [ADR 0008](./0008-messages-auto-open.md)

## Context

Phases 38–39 put live DM bodies on Firebase RTDB while MySQL stayed the system of record. Dual-write (and even “client write + Laravel persist”) still left the composer and peer path coupled to HTTP, and `POST …/read` spammed the server.

Security Rules cannot check the MySQL mutual-follow graph. Laravel must remain the **authorization gate**, but it does not need to store chat history.

Existing MySQL DM rows are disposable (demo / closed community). No migrate.

## Decision

1. **RTDB is the durable store for 1:1 chat** (inbox, thread, last message, unread, read receipts). MySQL keeps users and the follow graph only.
2. Conversation id is the string `{minUid}_{maxUid}` (never an auto-increment).
3. Laravel exposes a **thin gate**:
   - `POST /messages/ensure` `{ username }` — mutual follow, Admin-write `members/{uid}`, return `{ id, other_user }`.
   - `POST /messages/media` — image upload, return `{ image_url }` (no message row).
   - Inertia shells for `/messages` and `/messages/{cid}` (no message hydrate).
4. The browser JS SDK is the only writer of `messages/*`, `last_message`, `read/{uid}`, and `users/{uid}/inbox/{cid}`.
5. Message badge = client sum of `inbox/*/unread`. Notification badge stays Laravel `users/{uid}/badges`.
6. Auto-open latest thread is **client-side** from the inbox snapshot (ADR 0008 server 302 is retired).
7. Reverb/Echo is **not** used for DM bodies. Chat requires `VITE_FIREBASE_*` locally as well as on cPanel.
8. Drop MySQL `messages`, `conversation_participants`, and `conversations`.

## Consequences

- Pros: peer latency is RTDB websocket only; no persist round-trip for text; no mark-read HTTP spam.
- Cons: history is not in MySQL (no server search, no SQL admin metrics); rules deploy is mandatory; lost MySQL DM history on migrate.
- Follow-ups: group chat, App Check, FCM — out of scope.

## Alternatives considered

- **Keep conversations table, drop messages only** — still a MySQL SoT for inbox; rejected for latency and unread complexity.
- **Keep dual-write** — extra HTTP and races; superseded.
- **Rules-only mutual-follow** — impossible without copying the follow graph into RTDB.
