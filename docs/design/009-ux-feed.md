# Design: Home feed (Phase 10)

- Phase: 10
- Status: Implemented
- Related: SRS §16, PROGRESS 10.A–10.E

## Goal

Compose `/feed` with Phase 8 chrome + Phase 9 units.

## UX / pages

- Drop large page H1/subtitle admin feel; optional small “Home” label
- Composer first; then post list with tighter gap
- EmptyState: “Your feed is empty” + CTA Explore + optional “Find people” → search
- Pagination: **Infinite scroll** via Inertia `Inertia::scroll` + `<InfiniteScroll>` (cursor API); avoid “Newer/Older”
- Loading: PostSkeleton ×3 while Inertia pending on first paint if useful

## Data & APIs

Keep existing cursor FeedService; presentation only.
