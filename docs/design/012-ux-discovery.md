# Design: Discovery (Phase 13)

- Phase: 13
- Status: Implemented
- Related: SRS §19, PROGRESS 13.A–13.F

## Goal

Global search entry, search/explore/tags polish, populate right rail.

## UX / pages

- Top-bar search field → `/search` (preserve `q` if typed)
- Search: clear tabs People / Posts / Tags; people rows like follow list; posts via PostCard; tags as chips/rows
- Explore: trending posts + trending tags modules; copy: posts “last 48 hours”, tags “last 7 days”
- Tag show: large `#slug` + post count if available + list
- Right rail: trending tags **only** on Home (`feed`), Search, and Tag show — not Explore (already has tags in-page), Messages, Profile, notifications, bookmarks, post detail, admin, or settings.

## Do / Don’t

- Don’t change ranking algorithms — presentation + copy accuracy only.
