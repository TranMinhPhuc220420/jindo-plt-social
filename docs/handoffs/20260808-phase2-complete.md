# Handoff — 2026-08-08 Phase 2 complete

## Done

Phase 2 (engagement & real-time):

- Likes: unique pair, JSON toggle, counts on cards via `PostPresenter`
- Comments: one-level nesting, soft deletes, `posts/show` + feed counts
- Notifications: follow/like/comment (no self-notify), list + mark read, unread shared in Inertia
- Reverb + `laravel-echo` / `pusher-js`; private `App.Models.User.{id}`
- Pest **62** passed; PHPStan / tsc / ESLint green

## Active next

**Phase 3** — multi-image media, 1:1 messaging, search/explore, Redis cache (SRS §6).

## Notes for next agent

- Local realtime: set `BROADCAST_CONNECTION=reverb` + `REVERB_*` / `VITE_REVERB_*` (see `.env.example`); run `php artisan reverb:start` alongside `composer run dev`.
- Testing uses `BROADCAST_CONNECTION=null` in `phpunit.xml`.
- After route changes: `php artisan wayfinder:generate --with-form` then `npm run build` for Inertia feature tests.
- Like toggle uses `fetch` + `X-XSRF-TOKEN` cookie (no CSRF meta tag in blade).
