# Design: Post create/edit dialog (Phase 23)

- Phase: 23
- Status: Implemented
- Related: SRS Phase 23

## Goal

Facebook-like hybrid composer: collapsed trigger on feed; create and edit share one Dialog shell with emoji, media add/remove, and clear actions.

## UX

- Collapsed: avatar + “What’s on your mind?”
- Dialog: title Create/Edit, author row, large textarea, media grid (X to remove), toolbar Photo | Emoji | counter | Post/Save
- Dirty close → confirm discard
- Edit existing media: X → `remove_media_ids[]` (no checkboxes)

## Non-goals

Audience, scheduling, drafts, video.
