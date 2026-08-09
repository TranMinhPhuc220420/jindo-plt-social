# Design: Motion showcase (Phase 18)

- Phase: 18
- Status: Implemented
- Related: SRS §24, ADR 0007

## Goal

Showcase moments on welcome, profile, lists, messages, page swaps.

## Specs

- **Welcome:** 2–3 parallax layers (`useScroll` / `useTransform`); stagger headline/CTA
- **Auth card:** FadeIn on mount
- **Profile:** cover `y` from scroll; avatar scale-in
- **Lists:** Stagger on feed/explore/bookmarks; AnimatePresence for new pages of posts
- **Messages:** bubbles `x` enter; typing opacity pulse
- **Page swap:** wrap social main in FadeIn keyed by `usePage().url`
- **Bell dropdown:** stagger items

## Performance

- Prefer `transform`/`opacity`; avoid animating width on long feeds
- Disable heavy parallax under reduced-motion
