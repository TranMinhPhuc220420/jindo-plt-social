# Design: Phase 6 hashtags

- Phase: 6
- Status: Implemented
- Related: SRS §12, ADR 0004

## Parse rules

- Regex: `(^|[^A-Za-z0-9_])#([A-Za-z0-9_]{2,40})\b`
- Normalize slug to lowercase; `name` stored as lowercase slug for display consistency.
- Cap: first **5** unique slugs per post body.
- Posts only (create/update); comments unchanged.

## Sync

`HashtagService::syncFor(Post, body)` upserts `tags`, syncs `post_tag`, detaches removed tags.

## Trending

Window: last **7 days** of `post_tag` rows joined to posts created in window (or pivot `created_at` if present). Score = attachment count. Limit 10 for Explore.

## Surfaces

- `/t/{slug}` — tagged posts
- Explore — `trending_tags`
- Search — `tab=tags`
