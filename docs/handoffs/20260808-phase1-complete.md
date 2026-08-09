# Handoff — 2026-08-08 Phase 1 complete

## Done

Phase 1 (core foundation & social graph) is implemented and quality-gated:

- Users: `username`, `bio`, avatar/cover paths, `role`, `suspended_at`
- Posts CRUD + soft deletes + optional image
- Follow graph + profile lists
- `FeedService` cursor pagination (15)
- Public profile `/u/{username}`, settings social fields, register username
- Minimal admin (`/admin/users`, `/admin/posts`)
- Pest 54 passed; PHPStan / `tsc` / ESLint clean after `wayfinder:generate --with-form` + `npm run build`

## Active next

**Phase 2** — likes, one-level comments, DB notifications + Reverb (see `docs/SRS.md` §5, `docs/PROGRESS.md`, `docs/architecture/module-map.md`).

## Notes for next agent

- Fortify `home` is `/feed`; `/dashboard` redirects to feed.
- Regenerate Wayfinder with `--with-form` after route changes.
- Rebuild Vite (`npm run build`) before Inertia feature tests that assert new pages when not using Vite hot.
- Demo seed: `DemoSocialSeeder` (local) — admin@example.com / alice / bob / carol.
