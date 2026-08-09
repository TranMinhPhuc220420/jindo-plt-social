# Design: Simple mobile chrome

- Phase: 25–27 (revised)
- Status: Implemented
- Related: SRS §32–34, ADR 0012 (glass abandoned), PROGRESS 25–27

## Goal

Solid, readable mobile chrome — no liquid glass / backdrop-filter decoration. Keep useful mobile IA from the glass experiment.

## Layout

```
┌─────────────────────────────┐
│ Top bar (solid card)        │  logo | search | bell | avatar
├─────────────────────────────┤
│                             │
│   Content (FB-like cards)   │
│                             │
├─────────────────────────────┤
│ Home Explore [+] Msg Profile│  solid dock + Create FAB
└─────────────────────────────┘
```

## Rules

- Surfaces: `bg-card` / `bg-background` / `border` only.
- Safe-area: top bar `pt-[env(safe-area-inset-top)]`, dock `pb-[env(safe-area-inset-bottom)]`.
- Hide dock on `messages/show` and while create/edit composer open.
- Composer mobile: bottom sheet (`rounded-t-2xl`), solid panel.
- Desktop: unchanged full-bleed top + left rail.

## Component map

| Piece | Path |
|-------|------|
| Top bar | `components/social/social-top-bar.tsx` |
| Bottom dock + FAB | `components/social/social-mobile-nav.tsx` |
| Create host | `components/posts/create-post-provider.tsx` |
| Shell | `components/social/social-chrome-shell.tsx` |
| Composer | `components/posts/post-composer-shell.tsx` |

## Do / Don’t

- Do prioritize tap targets (44px+) and clear active states.
- Don’t reintroduce glass/blur chrome without a new ADR.
