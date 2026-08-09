# Handoff — 2026-08-09 Phase 6 complete

## Done

Phase 6 (hashtags & topic discovery):

- Schema: `tags` + `post_tag`; `Tag` model; `Post::tags()`
- `HashtagService`: extract (regex, lowercase, max 5) + `syncFor` on post create/update
- Surfaces: `GET /t/{slug}`, Explore `trending_tags` (7d / top 10), Search `tab=tags`
- FE: `resources/js/lib/rich-text.tsx` linkifies `#tag` + `@user` in post cards (comments keep `@` only)
- ADR 0004 + design `005-phase6-hashtags.md`
- Pest **98** passed; PHPStan / tsc / ESLint / wayfinder / build green

## Active next

Roadmap through Phase 6 is complete. Candidates: FULLTEXT search ADR, production S3 disk cutover, or Horizon — only after new SRS/ADR. Out of P6: follow-tag, comment hashtags, quote-repost.

## Notes for next agent

- Local DB: `php artisan migrate` for `tags` / `post_tag`.
- Hashtag parse is post body only; no notifications on tag use.
- Trending score = `post_tag` attachment count in last 7 days (pivot `created_at`).
