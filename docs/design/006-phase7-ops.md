# Design: Phase 7 ops

- Phase: 7
- Status: Implemented
- Related: SRS §13, ADR 0005

## FULLTEXT

- Migration: add FULLTEXT on `posts.body` only when driver is `mysql` / `mariadb`.
- [`SearchService::posts`](../../app/Services/SearchService.php): branch on driver; empty query → zero results; order unchanged (`created_at`, `id`).
- MySQL stopwords / short tokens may return fewer hits than `LIKE` — acceptable for P7.

## Media disk

- Config: `filesystems.media` = `env('MEDIA_DISK', 'public')` (disk **name**, not a new Flysystem disk).
- Callers: `Storage::disk(config('filesystems.media'))` via `App\Support\MediaDisk`.
- Job: `Storage::get` / `put` / `delete` — no `path()`.
- Backfill (existing local files → S3):

```bash
aws s3 sync storage/app/public s3://$AWS_BUCKET/ \
  --exclude "*" --include "avatars/*" --include "covers/*" \
  --include "posts/*" --include "messages/*"
```

Then set `MEDIA_DISK=s3` and `AWS_*` (+ `AWS_URL` / `AWS_ENDPOINT` if MinIO/R2/CDN).

## Horizon

- `composer require laravel/horizon`; `php artisan horizon:install`.
- Gate: `viewHorizon` → `$user->isAdmin()`.
- Worker: `php artisan horizon` (replaces `queue:work redis --tries=3` in runbook).
- Dashboard: `/horizon` (admin). Keep `/admin/failed-jobs`.

## Local processes (supersedes queue row in 003)

| Process | Command |
|---------|---------|
| Redis | `make redis` |
| Queue / Horizon | `php artisan horizon` |
| Failed jobs UI | `/admin/failed-jobs` + `/horizon` |
| Reverb | `php artisan reverb:start` |
