# Design: Motion interactions (Phase 17)

- Phase: 17
- Status: Implemented
- Related: SRS §23, ADR 0007

## Goal

Daily micro-interactions on post/nav units.

## Specs

- **Like:** `whileTap` scale + spring to liked; 4–6 CSS particles max, skip if reduced-motion
- **Bookmark:** icon spring fill
- **Composer:** `layout` / height animate on expand
- **PostCard:** enter via StaggerItem (no hover lift)
- **Nav:** `layoutId="nav-active"` pill behind active item
- **ConfirmDialog:** content spring scale 0.96→1
- **Comments/Follow:** AnimatePresence on reply form; button whileTap

## Do / Don’t

- Do keep action bar readable (no covering particles).
- Don’t block clicks during animation.
