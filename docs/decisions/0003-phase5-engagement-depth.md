# ADR 0003: Phase 5 engagement depth (bookmarks, mentions, post search)

- Status: Accepted
- Date: 2026-08-09

## Context

Phases 1–4 delivered the social MVP and hardening. ADR 0002 deferred bookmarks/@mentions until after Phase 4. Users need save-for-later and addressable `@username` without opening groups/stories/hashtags.

## Decision

- Ship **bookmarks** (unique pair, JSON toggle, `/bookmarks`, no notifications).
- Ship **@mentions** on post create/update and comment create with DB+broadcast notify (no self-notify; max 10 unique usernames per body).
- Ship **post search** as a tab on `/search` using portable `LIKE` on `posts.body`.
- Continue to exclude groups, stories, ads, hashtags, quote-repost.

## Consequences

- Agents treat Phase 5 items in `PROGRESS.md` as active until the overview is `[x]`.
- Mention linkify must stay React-safe (no unsanitized HTML).

## Alternatives considered

- FULLTEXT indexes immediately — deferred; portability with SQLite tests matters.
- Bookmark notifications — rejected as noise.
- Hashtags in same phase — deferred to keep scope tight.
