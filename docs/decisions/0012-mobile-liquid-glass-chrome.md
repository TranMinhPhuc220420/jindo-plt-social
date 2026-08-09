# ADR 0012: Mobile chrome (liquid glass abandoned)

- Status: Superseded — simple solid mobile chrome
- Date: 2026-08-09
- Superseded: 2026-08-09

## Context

Phases 25–27 initially shipped Apple-style liquid glass for mobile chrome. The effect was hard to tune (nested blur, dock bleed-through, muddy composer) and did not meet product quality bar.

## Decision

1. **Abandon liquid glass** (tokens, `GlassSurface`, backdrop-filter chrome, glass dialogs).
2. Keep **simple solid mobile chrome**:
   - Full-bleed solid top bar (`bg-card` + border + safe-area)
   - Full-bleed solid bottom dock with Create FAB
   - Dock slots: Home | Explore | Create | Messages | Profile (Alerts via bell)
   - Hide dock on message thread and while composer is open
   - Mobile composer as bottom sheet (solid `bg-background`)
3. Desktop chrome unchanged (Facebook-like per ADR 0006).
4. Presentation-only; no new product domains.

## Consequences

- Remove `--glass-*` CSS and glass utilities.
- Design note `024` documents simple mobile chrome instead of glass.
- Prefer clarity and touch targets over decorative materials.

## Alternatives considered

- Keep iterating liquid glass — rejected by product.
- Revert all mobile nav IA changes — rejected; FAB + dock slots still useful.
