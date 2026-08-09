# Design: Phase 4 ops runbook

- Phase: 4
- Status: Implemented
- Related: SRS §10, ADR 0002

## Local / staging processes

| Process | Command | Notes |
|---------|---------|--------|
| Redis | `make redis` (`docker compose up -d redis`) | Required for cache/queue; `make clear` fails with “Connection refused” if down |
| App + Vite | `composer run dev` | HTTP + assets |
| Queue worker | `php artisan horizon` (see [`006-phase7-ops.md`](./006-phase7-ops.md); fallback `queue:work redis --tries=3`) | Media jobs; Horizon dashboard `/horizon` |
| Reverb | `php artisan reverb:start` | DM + notification broadcasts |
| Failed jobs CLI | `php artisan queue:failed` / `queue:retry {id}` | Admins also see `/admin/failed-jobs` and Horizon |

## Env

- `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis` (see `.env.example`). Start Redis first (`make redis`).
- Media disk: `MEDIA_DISK=public` locally; prod `MEDIA_DISK=s3` + `AWS_*` (and `AWS_URL` / `AWS_ENDPOINT` if needed). See [`006-phase7-ops.md`](./006-phase7-ops.md).
- Tests keep `array` / `sync` / `null` broadcast via `phpunit.xml`.

## Structured logs

`App\Support\StructuredLog` — use for media job failures and broadcast/auth anomalies with keys like `post_media_id`, `user_id`, `conversation_id`.
