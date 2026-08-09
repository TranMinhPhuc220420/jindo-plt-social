# Design: Motion foundation (Phase 16)

- Phase: 16
- Status: Implemented
- Related: SRS §22, ADR 0007

## Goal

Shared motion primitives before surface wiring.

## Helpers (`resources/js/components/motion/`)

| Export | Role |
|--------|------|
| `MotionProvider` | `MotionConfig` + reduced-motion |
| `FadeIn` | opacity + y enter |
| `Stagger` / `StaggerItem` | list children delay |
| `usePrefersReducedMotion` | hook wrapper |

## CSS tokens

```css
--motion-fast: 150ms;
--motion-normal: 250ms;
--motion-slow: 400ms;
--motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

Shimmer keyframes for skeletons.

## Do / Don’t

- Do short-circuit animations when reduced-motion.
- Don’t animate layout on every keystroke in composers beyond expand.
- Don’t add purple glow.
