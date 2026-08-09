# Handoff: Simple mobile chrome (glass abandoned)

- Date: 2026-08-09
- Status: Complete

## Change

Liquid glass reverted. Mobile chrome is solid FB-like surfaces with:

- Top bar: solid `bg-card`, compact height, safe-area
- Dock: Home | Explore | Create FAB | Messages | Profile
- Create via `CreatePostProvider`
- Hide dock on message thread + while composer open
- Composer: solid bottom sheet on mobile

## Files

- Removed: `glass-surface.tsx`, `--glass-*` CSS
- Updated: top bar, mobile nav, dialog, composer, auth, welcome, settings, sheet, like picker

## Verify

Narrow viewport: solid chrome, FAB opens composer, thread has no dock overlap.
