# Design: Firebase-only DMs

- Phase: 40
- Status: Implemented
- Related: SRS Phase 40, ADR 0020, ADR 0014/0019 (amended)

## Goal

1:1 chat lives entirely on Firebase RTDB. Laravel only gates mutual-follow, writes the members map, and uploads images.

## UX / pages

- Inbox (`/messages`, `/messages?inbox=1`): hydrate from `users/{uid}/inbox`, sort by `updated_at`. Empty until Firebase signs in.
- Desktop auto-open: after the first inbox snapshot, visit the latest `cid` unless `?inbox=1`.
- Thread (`/messages/{minUid}_{maxUid}`): Inertia provides `other_user` only. Messages come from `onChildAdded` (`limitToLast(100)`).
- Composer: **text writes RTDB only** (no POST body). Photo: `POST /messages/media` then RTDB. Composer stays unlocked.
- Seen: `read/{peer}.at >= message.at`.
- Share-to-DM: ensure + JSON `{ conversations: [{ id, other_user, body, shared_post, user }] }` then client RTDB write.

## Data & APIs

### RTDB

```
realtime/conversations/{cid}/
  members/{uid}: true          # Admin ensure only
  messages/{pushId}: { client_id, conversation_id, body, image_url, shared_post?, created_at, at, user }
  last_message: { body, created_at, sender_id }
  read/{uid}: { at }
  typing/{uid}

realtime/users/{uid}/inbox/{cid}/
  peer: { id, name, username, avatar }
  last_message: { body, created_at }
  unread: number               # 0 for self on send; +1 for peer
  updated_at
```

`cid` = `{minUid}_{maxUid}`. Clients must not write `mysql_id` or `members`.

### HTTP

| Method | Path | Result |
|--------|------|--------|
| POST | `/messages/ensure` | `{ id, other_user }` or Inertia redirect to thread |
| POST | `/messages/media` | `{ image_url }` |
| GET | `/messages` | Inertia shell `conversations: []` |
| GET | `/messages/{cid}` | Shell + `other_user`; `messages: []` |
| POST | `/posts/{post}/share-message` | `{ conversations: [...] }` (JSON) |

No `POST /messages/{id}/messages`, no `POST …/read`.

### Send (multi-path `update`)

Message node + `last_message` + self inbox (`unread: 0`) + peer inbox (`unread` increment).

### Read

On thread open (once per `cid`): `read/{self}.at = now`, `inbox/{cid}.unread = 0`.

## Open questions

None. Group chat, server-side search, App Check, FCM — out of scope.
