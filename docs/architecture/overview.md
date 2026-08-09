# Architecture overview

## Stack (actual)

- **Backend:** Laravel 13, PHP 8.3, Fortify (auth), Wayfinder
- **Frontend:** Inertia React 3, TypeScript, Tailwind 4, shadcn/Radix
- **Default local data:** SQLite; cache/queue drivers often `database` until Phase 2–3

## Request flow

```text
Browser (React + Inertia)
  → routes/web.php (+ Fortify)
  → Controller + Form Request + Policy
  → Model / Service
  → DB / Storage / Queue
  → Inertia::render(page) or redirect
```

Realtime (Phase 2+): Laravel events → Reverb → Echo on the client.

## Key directories

| Path | Role |
|------|------|
| `app/Models` | Eloquent models |
| `app/Http/Controllers` | Thin HTTP/Inertia controllers |
| `app/Http/Requests` | Validation |
| `app/Policies` | Authorization (add as features land) |
| `app/Services` | Domain services (e.g. FeedService) — add when needed |
| `resources/js/pages` | Inertia pages |
| `resources/js/components` | Shared UI |
| `resources/js/actions` / `routes` | Wayfinder-generated — prefer over hard-coded URLs |
| `database/migrations` | Schema |
| `tests` | Pest |

## Product surfaces (phased)

See SRS page map and [`../PROGRESS.md`](../PROGRESS.md). Phase 1 centers on feed + public profile + follows.

Full create/extend path list per phase: [`module-map.md`](./module-map.md).
