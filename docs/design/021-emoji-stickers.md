# Design: Emoji picker + large emoji stickers (Phase 22)

- Phase: 22
- Status: Implemented
- Related: SRS Phase 22

## Goal

Pick Unicode emoji in Messages, Posts, and Comments. Emoji-only bodies (1–3 graphemes) render as large “stickers”. No image packs.

## Library

`emoji-picker-react` with `EmojiStyle.NATIVE`, hosted in a DropdownMenu from a shared `EmojiPickerButton`.

## Helpers

- `insertTextAtCursor` for controlled textareas
- `isEmojiOnly` via `Intl.Segmenter` (1–3 graphemes, no letters/digits)

## Surfaces

- Composers: message, post, comment — smile button inserts at caret
- Display: message thread, post body, comment body — large when emoji-only and no image

## Non-goals

Image sticker packs, GIF APIs, reaction picker on posts.
