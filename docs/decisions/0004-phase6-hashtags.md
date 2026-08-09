# ADR 0004: Phase 6 prioritizes hashtags over ops cutover

- Status: Accepted
- Date: 2026-08-09

## Context

Phase 5 deferred hashtags. Handoff candidates included hashtags, FULLTEXT, S3 disk cutover, and Horizon. Product discovery (topics) was the clearest user-facing gap after mentions/bookmarks.

## Decision

- **Phase 6** ships hashtags: parse/sync on posts, `/t/{slug}`, explore trending tags (7d), search `tab=tags`, FE linkify.
- Defer FULLTEXT body search, Horizon, and S3 media disk cutover to a later ops-focused phase + ADR.

## Consequences

- Agents treat Phase 6 items in `PROGRESS.md` as active until overview is `[x]`.
- No follow-tag, hashtag notifications, or comment hashtag parsing in this phase.

## Alternatives considered

- Ops-first (S3/Horizon) — deferred; product discovery unfinished.
- FULLTEXT with hashtags — deferred for SQLite test portability.
