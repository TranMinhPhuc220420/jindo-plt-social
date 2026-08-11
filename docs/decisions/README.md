# Architecture Decision Records (ADR)

Record **durable** choices that future agents must not casually reverse.

## Naming

`NNNN-short-title.md` — zero-padded, e.g. `0001-use-inertia-not-spa-api.md`.

## Template

Copy into a new file:

```markdown
# ADR NNNN: Title

- Status: Proposed | Accepted | Superseded by ADR NNNN
- Date: YYYY-MM-DD

## Context

What problem forced a decision?

## Decision

What we will do.

## Consequences

Pros, cons, follow-ups.

## Alternatives considered

Brief list of rejected options.
```

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](./0001-inertia-fortify-baseline.md) | Keep Inertia + Fortify baseline (no Breeze/SPA API) | Accepted |
| [0002](./0002-phase4-hardening.md) | Phase 4 prioritizes hardening over new domains | Accepted |
| [0003](./0003-phase5-engagement-depth.md) | Phase 5 engagement depth (bookmarks, mentions, post search) | Accepted |
| [0004](./0004-phase6-hashtags.md) | Phase 6 prioritizes hashtags over ops cutover | Accepted |
| [0005](./0005-phase7-ops.md) | Phase 7 ops cutover (FULLTEXT + media + Horizon) | Accepted |
| [0006](./0006-facebook-like-ux-chrome.md) | Facebook-like UX chrome & redesign phases 8–15 | Accepted |
| [0007](./0007-motion-showcase.md) | Motion showcase (`motion` + reduced-motion) | Accepted |
| [0008](./0008-messages-auto-open.md) | Messages auto-open + full-width shell (mobile inbox via `?inbox=1`) | Accepted |
| [0009](./0009-profile-field-privacy.md) | Profile field privacy (public/mutual/only_me) | Accepted |
| [0010](./0010-post-reactions.md) | Post reactions (multi-expression likes) | Accepted |
| [0011](./0011-safe-post-markdown.md) | Safe post markdown (social subset + sanitize) | Accepted |
| [0012](./0012-mobile-liquid-glass-chrome.md) | Mobile chrome (glass abandoned → solid) | Superseded |
| [0013](./0013-post-share.md) | Facebook-like post share (feed + copy + DM) | Accepted |
| [0014](./0014-firebase-realtime-event-bus.md) | Firebase RTDB event bus (MySQL SoT) on cPanel | Accepted |
