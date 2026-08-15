# Design: Firebase live DM cache

- Phase: 38–39
- Status: Implemented
- Related: SRS Phase 38–39, ADR 0019, ADR 0014 (amended)

## Goal

Peer DMs render from Firebase RTDB without Laravel Admin REST on the message path. MySQL stays durable SoT.

## UX / pages

No layout change. Open thread (`messages/show`):

- Sender: optimistic bubble immediately; composer stays unlocked so the next message can send without waiting for POST `/messages/{id}/messages`.
- Receiver: append from RTDB `onChildAdded` (full `body` / user / media URLs). Do not wait for Inertia or a MySQL refetch.
- Persist fail: sender toasts; both sides drop the live bubble (`remove()`). Draft in the composer is not restored (would clobber a newer message).

## Data & APIs

### RTDB

```
realtime/conversations/{cid}/
  members/{uid}: true          # Admin SDK only
  messages/{clientUuid}: { client_id, conversation_id, body, image_url, shared_post?, created_at, at, user{…} }
  last_message: { body, created_at, sender_id }
  typing/{uid}
```

`events/message` is deprecated (no new writes). Clients must not write `mysql_id`. Laravel does not write `messages/*` or `last_message`.

### HTTP

`POST /messages/{conversation}` accepts optional `client_uuid` (Firebase push key). Replay of the same sender+conversation+uuid returns the existing row (200 JSON). New insert is 201. Persist only — no RTDB publish on the Firebase driver.

`POST /posts/{post}/share-message` with `Accept: application/json` returns `{ messages: ChatMessage[] }` (includes `conversation_id`) so the client can write RTDB.

### Client (Firebase driver)

- **Text:** `push()` → `update()` message + `last_message` → POST persist in the background.
- **Image:** POST upload → JSON `image_url` → client `update()` RTDB.
- **Share-to-DM:** POST persist → JSON list → client `update()` each conversation.
- On persist 4xx/5xx for text: `remove()` the RTDB node.

Reverb: HTTP + Echo `MessageSent` only.

## Open questions

None. Badge fan-out stays afterResponse. Members map stays server-side.
