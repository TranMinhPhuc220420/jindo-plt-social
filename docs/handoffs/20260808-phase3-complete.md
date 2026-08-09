# Handoff — 2026-08-08 Phase 3 complete

## Done

Phase 3 (advanced features & performance):

- **Media:** `post_media` (max 6), migrate off `posts.image_path`, `ProcessPostMediaJob` (GD resize ≤1600 + JPEG), uploader + carousel + processing badge
- **DM:** mutual-follow gate, conversations/messages, Reverb `conversation.{id}` (`message.sent` / `user.typing`), read on thread open, inbox + thread UI
- **Discover:** auth search (username prefix / name contains), explore 48h score `likes*2+comments`
- **Perf:** hot-path indexes confirmed/added, `feed:authors:{id}` TTL 60s + invalidate on follow/post, `.env.example` Redis queue/cache, [`docs/design/002-phase3-perf.md`](../design/002-phase3-perf.md)
- Quality: Pest **72** passed; Pint / PHPStan / tsc / ESLint / `wayfinder:generate` / `npm run build` green

## Active next

Roadmap phases 1–3 are complete. Next work is product polish / ops (production Redis, Reverb, media disk) or a new phase if SRS grows.

## Notes for next agent

- Copy `.env.example` Redis defaults locally; run a queue worker for media jobs (`php artisan queue:work`).
- Reverb still required for live DM/notifications: `php artisan reverb:start` + matching `VITE_REVERB_*`.
- Tests keep `CACHE_STORE=array`, `QUEUE_CONNECTION=sync`, `BROADCAST_CONNECTION=null`.
- After new routes/pages: `php artisan wayfinder:generate --with-form` then `npm run build`.
