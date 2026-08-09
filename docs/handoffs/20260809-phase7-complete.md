# Handoff — 2026-08-09 Phase 7 complete

## Done

Phase 7 (ops cutover):

- FULLTEXT: MySQL/MariaDB index on `posts.body` + `whereFullText`; SQLite tests keep `LIKE`
- Media: `MEDIA_DISK` / `App\Support\MediaDisk`; all avatars/covers/posts/messages callers; `ProcessPostMediaJob` uses `get`/`put`/`delete` (S3-safe)
- Horizon: `laravel/horizon`; `viewHorizon` → `User::isAdmin()`; keep `/admin/failed-jobs`
- ADR 0005 + design `006-phase7-ops.md`; runbook `003` points to Horizon
- Pest **102** passed; PHPStan / tsc / ESLint / build green

## Active next

Roadmap through Phase 7 is complete. Product candidates (only after new SRS/ADR): follow-tag, quote-repost, or other §1.4 items if ever approved. Ops follow-ups: Supervisor for Horizon in prod, actual S3 backfill when cutting over.

## Notes for next agent

- Local: `MEDIA_DISK=public` (default); prod: `MEDIA_DISK=s3` + `AWS_*` (+ `AWS_URL`/`AWS_ENDPOINT` if needed). Backfill: see design 006.
- Worker: `php artisan horizon` (Redis required: `make redis`).
- MySQL FULLTEXT may miss stopwords/short tokens vs previous `LIKE` — intentional.
