# ADR 0005: Phase 7 ops cutover (FULLTEXT + media + Horizon)

- Status: Accepted
- Date: 2026-08-09

## Context

Phases 1–6 shipped product features. FULLTEXT, S3 disk cutover, and Horizon were deferred (ADR 0003/0004) for SQLite test portability and product priority. With Phase 6 complete, production ops gaps are the clearest remaining work.

## Decision

Ship **Phase 7** as one ops phase covering:

1. **FULLTEXT** — MySQL/MariaDB `FULLTEXT` on `posts.body` + `whereFullText`; SQLite/tests keep `LIKE`.
2. **Media disk** — `MEDIA_DISK` (default `public`, prod `s3`); all media callers use `config('filesystems.media')`. Do not flip `FILESYSTEM_DISK` default (`local` stays private).
3. **Horizon** — install; `viewHorizon` → `User::isAdmin()`; keep Inertia `/admin/failed-jobs`.

## Consequences

- Post search is faster/better on MySQL; Pest remains portable on SQLite.
- S3 cutover is env + backfill (`aws s3 sync`); `ProcessPostMediaJob` must not use local `path()`.
- Workers run via `php artisan horizon` instead of raw `queue:work`.

## Alternatives considered

- Separate phases per concern — deferred; user chose combined ops phase.
- Use `FILESYSTEM_DISK` default for media — rejected; default `local` is private and would break public URLs.
- Drop custom failed-jobs UI — rejected; keep as simple admin list alongside Horizon.
