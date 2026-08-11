# ADR 0014: Firebase Realtime Database as event bus (MySQL SoT)

- Status: Accepted
- Date: 2026-08-11

## Context

Shared cPanel hosting cannot run a persistent WebSocket process (Laravel Reverb). Production previously set `BROADCAST_CONNECTION=log`, so DMs, typing, badges, and notification bell updates were not live.

We need realtime UX on production without moving the system of record off MySQL, and without rewriting every business call site that already uses `broadcast()` / `ShouldBroadcastNow`.

## Decision

1. Use **Firebase Realtime Database (RTDB)** only as an **event bus** for UI payloads (messages, badges, notifications, typing). **MySQL remains the source of truth.** Event nodes under `realtime/.../events/*` are **overwrite** paths (not append-only history).
2. Add a custom Laravel broadcast driver `firebase` so existing events and notifications keep working.
3. Keep **Reverb + Echo** available locally via `BROADCAST_CONNECTION=reverb`.
4. On cPanel: `BROADCAST_CONNECTION=firebase` with Admin SDK credentials outside the web root.
5. Maintain a living inventory of realtime capabilities in [`../architecture/realtime-inventory.md`](../architecture/realtime-inventory.md); update it whenever capabilities are added or removed.

## Consequences

- Pros: Works on shared hosting; minimal change to controllers; fail-soft if RTDB is down; dual-driver keeps local Reverb workflow.
- Cons: Dual-write complexity; Security Rules + custom tokens required; Firebase cost/ops; Echo whisper typing needs an RTDB (or HTTP) equivalent.
- Follow-ups: Optional TTL cleanup of RTDB event nodes; FCM push is out of scope for this ADR.

## Alternatives considered

- **Pusher / Ably** — less custom code with Echo, but paid SaaS and not the chosen direction for this project.
- **Firestore as the event store** — more flexible queries; heavier than needed for ephemeral channel events.
- **Polling only on cPanel** — simplest ops, poor UX for DM/notifications.
- **Move hosting to VPS for Reverb** — rejected while product stays on cPanel.
