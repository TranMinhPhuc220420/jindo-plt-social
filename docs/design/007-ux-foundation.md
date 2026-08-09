# Design: UX foundation (Phase 8)

- Phase: 8
- Status: Implemented
- Related: SRS §14, ADR 0006, PROGRESS 8.A–8.G

## Goal

Ship Facebook-like **app chrome** + **tokens** + **shared primitives** without redesigning post content.

## Layout (desktop)

```
┌─────────────────────────────────────────────────────────┐
│ Top bar: Logo | Search entry | Create | Bell | Avatar   │
├──────────┬──────────────────────────┬───────────────────┤
│ Left rail│ Center (~680px max)      │ Right rail (opt)  │
│ Home     │ page children            │ placeholder P13   │
│ Profile  │                          │                   │
│ Messages │                          │                   │
│ …        │                          │                   │
└──────────┴──────────────────────────┴───────────────────┘
```

Mobile: top bar compact; left rail → bottom nav (Home, Explore, Create, Messages, Profile) or sheet.

**Scroll:** viewport-locked shell (`h-dvh overflow-hidden`) — document does not scroll; center `main` scrolls in page mode (`scroll-region`); messages panes scroll internally. Shared via `SocialChromeShell`.

## Component map

| New / change | Path |
|--------------|------|
| Social chrome shell | `components/social/social-chrome-shell.tsx` (viewport lock + main modes) |
| Social layout | `resources/js/layouts/app/app-social-layout.tsx` |
| Default AppLayout | point to social layout |
| Top bar | `components/social/social-top-bar.tsx` |
| Left rail | `components/social/social-left-rail.tsx` |
| Right rail | `components/social/social-right-rail.tsx` |
| EmptyState | `components/social/empty-state.tsx` |
| Skeletons | `components/social/post-skeleton.tsx` |
| Confirm dialog | reuse shadcn Dialog wrapper `components/social/confirm-dialog.tsx` |
| Tokens | `resources/css/app.css` primary → social blue |

## Do / Don’t

- Do keep shadcn primitives; change shell only.
- Don’t redesign PostCard (Phase 9).
- Don’t show breadcrumbs on feed/profile/messages/etc.
- Don’t use Meta trademarks/logos.

## Open questions

None — defaults in SRS §22 (load-more, Enter-to-send) apply to later phases.
