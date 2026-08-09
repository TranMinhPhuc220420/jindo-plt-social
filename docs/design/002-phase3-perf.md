# Design: Phase 3 performance

- Phase: 3
- Status: Implemented
- Related: SRS §6, PROGRESS 3.D

## Goal

Document hot-path indexes, explore scoring, and Redis/cache keys used in Phase 3.

## Explore score

Window: posts with `created_at >= now() - 48 hours`.

Score (ordered desc, then `created_at` desc):

```
likes_count * 2 + comments_count
```

Implemented in `ExploreService` via `withCount` aliases + `orderByRaw`.

## Feed author cache

| Key | TTL | Value |
|-----|-----|--------|
| `feed:authors:{userId}` | 60s | list of author IDs (self + following) |

Invalidation:

- `FeedService::forgetAuthorCache` on follow / unfollow
- post create also forgets the author's cache key (cheap safety)

Local `.env.example` defaults: `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis` (phpredis). Tests keep `array` / `sync` / `null` broadcast via `phpunit.xml`.

## Indexes (query plan review)

| Table | Index | Notes |
|-------|--------|--------|
| `users` | unique `username` | prefix search / profile lookup |
| `posts` | `(user_id, created_at)`, `created_at` | feed + explore window |
| `likes` | unique `(user_id, post_id)`, `post_id` | toggle + counts |
| `comments` | `(post_id, created_at)`, `user_id` | thread + author queries |
| `follows` | unique pair, `following_id` | graph + mutual checks |
| `post_media` | `(post_id, position)` | carousel order |
| `messages` | `(conversation_id, created_at)` | thread pagination |
| `conversation_participants` | unique pair, `user_id` | inbox membership |

## N+1 notes

- Feed / explore: `engagementQuery` eager-loads `user`, `media`, like/comment counts, viewer liked exists.
- DM inbox: conversations with `participants` + latest message limit 1.
