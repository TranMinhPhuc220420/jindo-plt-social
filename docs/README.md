# Docs map (for humans & coding agents)

Lean index. Deep detail lives in the linked folders — do not duplicate SRS here.

| Path | Purpose | Who updates |
|------|---------|-------------|
| [SRS.md](./SRS.md) | Product requirements, phases, NFR | Human (+ agent when requirements change) |
| [PROGRESS.md](./PROGRESS.md) | Phase checkboxes & session log | **Agent every implementation turn** |
| [architecture/](./architecture/) | System shape, data flows, module map | When architecture changes |
| [decisions/](./decisions/) | ADRs — why we chose X over Y | When a durable decision is made |
| [design/](./design/) | Feature/design notes before or during build | Per non-trivial feature |
| [notes/](./notes/) | Blockers, scratch state, investigation | During active work |
| [handoffs/](./handoffs/) | End-of-session handoff for the next agent | End of long sessions |
| [prompts/](./prompts/) | Reusable Cursor prompt seeds per phase | Rarely; keep short |
| [OPS_RUNBOOK.md](./OPS_RUNBOOK.md) | cPanel deploy / extract / queue / smoke | When ops or CI deploy changes |

## Agent read order

1. Root [`AGENTS.md`](../AGENTS.md) — constraints & commands  
2. [`PROGRESS.md`](./PROGRESS.md) — what is active  
3. Relevant phase in [`SRS.md`](./SRS.md)  
4. Only if needed: `architecture/`, `decisions/`, latest `handoffs/`, `design/`

## Rules of thumb

- Spec = SRS. Status = PROGRESS. Session bridge = handoffs. Why = decisions.
- Prefer linking files over pasting large blobs into chat.
- Do not invent new top-level doc folders without updating this map and `AGENTS.md`.
