# Architecture

Living notes on how PLT Social is structured in this repo. Keep entries short; link to code paths.

## Contents

| File | Topic |
|------|--------|
| [overview.md](./overview.md) | Stack, request flow, key directories |
| [module-map.md](./module-map.md) | Phased folder/file blueprint (P1–P3) |
| [realtime-inventory.md](./realtime-inventory.md) | Living list of realtime capabilities (Echo / Firebase RTDB) |

## When to update

- New domain module (feed, follows, messaging, …)
- Change to auth, broadcasting, storage, or queue topology
- Inertia page map changes materially

Do **not** copy full SRS here — link to [`../SRS.md`](../SRS.md) instead.
