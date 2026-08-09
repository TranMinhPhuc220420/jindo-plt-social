# ADR 0010: Post reactions (multi-expression likes)

- Status: Accepted
- Date: 2026-08-09

## Context

Phase 2 shipped binary likes (`likes` unique on `user_id`+`post_id`). Product needs Facebook/LinkedIn-style expressions beyond a single heart.

## Decision

1. Keep the `likes` table; add `type` string column (default `like`). One row per user/post — changing expression updates `type`.
2. Fixed allow-list of seven types: `like`, `love`, `haha`, `sad`, `celebrate`, `support`, `insightful` (`App\Enums\ReactionType`).
3. API: `POST /posts/{post}/like` with optional `{ type }` upserts; `DELETE` removes. JSON returns `viewer_reaction`, `likes_count`, `reaction_counts`.
4. UI: short click toggles default `like` / remove; hover (desktop) or long-press (mobile) opens a reaction picker.
5. Notify only on first create (not type-change); message includes reaction type.

## Consequences

- Explore score continues to use total `likes_count` (all types).
- Existing like rows backfill to `like`.
- Frontend drops sole reliance on `liked_by_viewer` boolean in favor of `viewer_reaction`.

## Alternatives considered

- Rename table to `reactions` — rejected; more churn for same shape.
- Full Facebook or LinkedIn sets only — rejected; product chose a hybrid seven.
- Multiple reactions per user — rejected; unique pair stays.
