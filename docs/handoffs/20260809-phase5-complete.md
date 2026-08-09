# Handoff — 2026-08-09 Phase 5 complete

## Done

Phase 5 (engagement depth):

- Bookmarks: unique pair, JSON toggle, `/bookmarks` + sidebar “Saved”, `bookmarked_by_viewer`
- Mentions: `MentionService` sync on post create/update + comment create; `UserMentionedNotification`; FE linkify
- Post search: `/search?tab=posts&q=` via `LIKE` on body
- ADR 0003 + design `004-phase5-mentions-bookmarks.md`
- Pest **90** passed; PHPStan / tsc / ESLint / wayfinder / build green

## Active next

Roadmap through Phase 5 is complete. Candidates: hashtags, FULLTEXT search ADR, production S3 disk cutover, or Horizon — only after new SRS/ADR.

## Notes for next agent

- Local MySQL: `php artisan migrate` for `bookmarks` / `mentions`.
- Bookmark list joins `bookmarks` without wiping `withExists` selects (do not `select('posts.*')` alone).
- Mention cap = 10 unique usernames; self-mentions skipped entirely.
