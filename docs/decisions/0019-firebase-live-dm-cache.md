# ADR 0019: Firebase RTDB live DM cache (client-owned)

- Status: Accepted (superseded for DM durability by [ADR 0020](./0020-firebase-durable-dms.md))
- Date: 2026-08-15
- Amended: 2026-08-15 (Phase 39 — client is the only writer of DM live nodes; Phase 40 — MySQL is no longer chat SoT)
- Amends: [ADR 0014](./0014-firebase-realtime-event-bus.md)

## Context

ADR 0014 used RTDB as an **overwrite event bus** (`realtime/conversations/{id}/events/message`). Laravel wrote MySQL first, then published via the Admin SDK (HTTP REST). On cPanel that path was 3–5s for the receiver.

Phase 38 added a client write for text, but Laravel still dual-wrote the same `messages/{uuid}` node via Admin REST after persist (images/share-to-DM only used that slow path).

## Decision

1. **Phase 38–39:** MySQL remained the source of truth for history, policy, images, share-to-DM, and unread. **Phase 40 / ADR 0020** moves durable 1:1 chat onto RTDB and drops MySQL messaging tables. This ADR still describes the live-cache write path that Phase 40 kept (client-owned `messages/*` + `last_message`).
2. RTDB holds an **append-only live cache** at `realtime/conversations/{id}/messages/{clientUuid}` plus `last_message`. Do not use overwrite `events/message` for DMs.
3. **The browser JS SDK is the only writer of DM live nodes** (`messages/*`, `last_message`) when `BROADCAST_CONNECTION=firebase`. Laravel Admin SDK must not `set`/`update` those paths.
4. **Text:** client writes RTDB first, then POSTs Laravel with `client_uuid` (idempotent persist).
5. **Images / share-to-DM:** Laravel persists (upload / embed) then the **client** writes RTDB from the JSON payload (`image_url` / `shared_post`).
6. **Members map** stays Admin-only (create/open conversation), not on send. **Unread badges** stay Laravel `afterResponse`.
7. **Reverb:** Echo `MessageSent` unchanged; no client RTDB write.
8. Live tail only. Thread hydrate stays MySQL/Inertia. Clients must not write `mysql_id`.

## Consequences

- Pros: peer latency matches RTDB websocket; no Admin REST on the message hot path; no dual-write races.
- Cons: Security Rules must allow member writes; rules deploy is mandatory; image/share live delivery waits on the HTTP persist then a client write.
- Follow-ups: optional TTL prune of RTDB messages.

## Alternatives considered

- **Keep Laravel-first Admin REST for all DMs** — 3–5s on cPanel; rejected.
- **Dual-write (Phase 38)** — client + Admin SDK; extra REST, races; superseded in Phase 39.
- **Firebase as durable store, drop MySQL for DMs** — rejected in Phase 38; **accepted in Phase 40** ([ADR 0020](./0020-firebase-durable-dms.md)).
