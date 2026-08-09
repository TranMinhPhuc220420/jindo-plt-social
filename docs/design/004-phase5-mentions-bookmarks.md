# Design: Phase 5 mentions & bookmarks

- Phase: 5
- Status: Implemented
- Related: SRS §11, ADR 0003

## Mentions

- Regex: `(^|[^A-Za-z0-9_])@([A-Za-z0-9_]{3,30})\b` — capture group 2 is the username.
- Cap: first **10** unique usernames (case-insensitive match to `users.username`).
- Sync on post store/update and comment store; delete stale mention rows on post update.
- Notify only newly mentioned users; never notify the actor.

## Bookmarks

- Toggle endpoints mirror likes; list is newest-first cursor page of bookmarked posts.
- `bookmarked_by_viewer` via `withExists` on engagement queries.

## Search tabs

- `tab=users` (default): existing username/name search.
- `tab=posts`: `body LIKE %q%`, paginate 15, engagement eager loads + presenter.
