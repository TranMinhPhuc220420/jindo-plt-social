# AGENTS.md — PLT Social

Operating manual for coding agents. Keep this file short; deep specs live under `docs/`.

## Mission

Build a phased social product on the **existing** Laravel React starter kit (Inertia + Fortify). Do not replace the stack.

## Read order (every implementation task)

1. `docs/PROGRESS.md` — active phase & checkboxes  
2. Matching phase in `docs/SRS.md`  
3. `docs/architecture/overview.md` if touching structure  
4. Latest `docs/handoffs/*` when resuming a session  
5. `docs/decisions/*` before reversing a past choice  

Doc map: `docs/README.md`.

## Hard constraints

- **Active phase only** — no Phase N+1 features until Phase N overview is `[x]` (unless the user overrides).
- **Stack:** Laravel 13, Inertia React, Fortify, Wayfinder, Pest, Tailwind/shadcn. No Breeze/Jetstream/SPA-only API (see `docs/decisions/0001-inertia-fortify-baseline.md`).
- **Progress:** update `docs/PROGRESS.md` when starting (`[~]`) and finishing (`[x]`) work; append Session log.
- **Quality:** prefer Form Requests, Policies, eager loads; add Pest for domain behavior; keep Pint/PHPStan/frontend checks green for touched code.

## Commands

```bash
composer setup          # first-time install (if needed)
composer test           # pint + phpstan + pest (see composer.json)
composer run dev        # app + vite via artisan dev
npm run types:check
npm run lint:check
php artisan migrate
```

## Code map (short)

- Backend: `app/` — Models, Http/Controllers, Requests; add `Policies`, `Services` as features land  
- Frontend: `resources/js/pages`, `resources/js/components`  
- Routes: `routes/web.php`, `routes/settings.php` + Fortify  
- Schema: `database/migrations`  
- Agent config: `.cursor/rules/`, `.cursor/skills/`

## Session hygiene

- Long session ending → write `docs/handoffs/YYYYMMDD-….md` and sync `PROGRESS.md`.  
- Stuck → `docs/notes/blocker-….md`.  
- Durable “why” → new ADR under `docs/decisions/`.
