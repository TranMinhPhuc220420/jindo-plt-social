# Handoffs

Write a handoff when ending a long session, switching agents/people, or context is about to overflow. The next session should be able to continue from files alone.

## Naming

`YYYYMMDD-phaseN-short-slug.md` — e.g. `20260808-phase1-user-username.md`.

## Template

```markdown
# Handoff: title

- Date:
- Phase: (from PROGRESS)
- Branch: (if any)

## Done this session

- …

## In progress

- … (match `[~]` items in PROGRESS.md)

## Not started / next

- …

## Files touched

- …

## How to verify

- Commands / manual checks

## Risks / watchouts

- …
```

## Index (newest first)

| File | Summary |
|------|---------|
| [20260815-client-only-dm-rtdb.md](./20260815-client-only-dm-rtdb.md) | Phase 39: client-only DM RTDB, no Laravel dual-write |
| [20260815-firebase-live-dm.md](./20260815-firebase-live-dm.md) | Phase 38: RTDB live DM cache, client-first text |
| [20260815-realtime-firebase-badges.md](./20260815-realtime-firebase-badges.md) | Phase 37: Firebase/Echo badge reliability |
