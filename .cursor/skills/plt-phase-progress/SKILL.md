---
name: plt-phase-progress
description: >-
  Updates PLT Social phase checkboxes in docs/PROGRESS.md when starting or
  finishing implementation work. Use when implementing SRS phases, marking
  progress, reporting what phase is done, or when the user asks for status /
  checklist updates.
---

# Update PLT Social phase progress

## When to use

- Starting or finishing any Phase 1–3 implementation task
- User asks “đã làm đến đâu?”, “đánh dấu phase”, or similar
- End of an agent turn that shipped meaningful phase work

## Steps

1. Open [`docs/PROGRESS.md`](../../../docs/PROGRESS.md) at the repo root.
2. Align work with [`docs/SRS.md`](../../../docs/SRS.md) for the active phase only.
3. Edit checkboxes with the legend:
   - `[ ]` not started
   - `[~]` in progress (exactly one primary active item when possible)
   - `[x]` done
   - `[!]` blocked
4. Refresh **Current focus** table: `Active phase`, `Active item`, `Last updated` (today), `Last note`.
5. Append a **Session log** row (newest first).
6. If a full phase quality gate is complete, check the phase overview box and advance `Active phase`.

## Do not

- Skip updating `docs/PROGRESS.md` after completing checklist work
- Mark a phase complete if its quality-gate section still has open items
- Implement Phase N+1 while Phase N overview is still `[ ]` / `[~]` unless the user overrides
