# ADR 0007: Motion showcase (`motion` + reduced-motion)

- Status: Accepted
- Date: 2026-08-09

## Context

Phases 8–15 shipped Facebook-like UX chrome and surfaces, but motion is mostly `transition-colors`, Radix `animate-in`, and `animate-pulse`. Users want a **showcase** motion level (parallax, springs, stagger, complex transitions) without abandoning the social product feel or inventing new domains.

## Decision

1. Ship **Phases 16–18** as a motion roadmap: foundation → interactions → showcase surfaces.
2. Add the **`motion`** package (`motion/react`) for springs, `AnimatePresence`, layout animations, and scroll/parallax.
3. Keep **`tw-animate-css`** for simple CSS enter/shimmer; add shared duration/easing CSS variables.
4. Honor **`prefers-reduced-motion`** via `MotionConfig` / `useReducedMotion()` — reduced mode uses opacity-only or instant transitions.
5. Cap particle/like-burst effects; no purple neon glow, WebGL, Lottie marketplace packs, or Stories/Reels UI.

## Consequences

- Bundle size grows by `motion`; acceptable for product polish.
- Agents must follow Active phase in PROGRESS (16 → 17 → 18).
- Presentation-only — no API/schema changes unless a specific effect requires a trivial prop.

## Alternatives considered

- CSS-only — rejected for showcase springs/parallax complexity.
- Framer Motion v10 package name — superseded by `motion`.
- Subtle-only motion — rejected; user chose showcase (2C).
