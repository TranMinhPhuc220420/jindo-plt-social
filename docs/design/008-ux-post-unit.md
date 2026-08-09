# Design: Post unit (Phase 9)

- Phase: 9
- Status: Implemented
- Related: SRS §15, PROGRESS 9.A–9.G

## Goal

Facebook-like **PostCard**, **composer**, **media** used on every timeline.

## UX / pages

Affects: feed, profile, explore, search posts, bookmarks, tags, post show — via shared components only.

### PostCard

- Header: avatar (link), display name (bold link), Instagram-style text `· Follow` / `Following`→`Unfollow` on hover when `can_follow`; `@username` · relative time
- Body: safe social Markdown (bold/italic/strike, lists, quote, code, http(s) links) + @/# linkify; CSS line-clamp + See more on lists; full body on post detail; no headings/tables/md images/HTML (ADR 0011)
- Media: hybrid below body (1–2 FB collage; 3+ carousel)
- Footer action bar: Reaction (7 types, picker) | Comment | Save with semibold count beside label when `> 0`
- Overflow menu: Edit / Delete (owner); Delete (admin)

### Composer

- Collapsed: avatar + “What’s on your mind?” button/input
- Expanded: textarea, Markdown hint, image preview grid, Post button, char remaining near 2000

### Media

- Upload: thumbnail grid + remove; max 6
- Hybrid display (Meta-inspired):
  - **1 image:** full-bleed, preserve aspect, `max-h` contain (no hard crop)
  - **2 images:** side-by-side collage, thin gap, `object-cover`
  - **3+ images:** shared-height carousel (tallest aspect; swipe + dots); lightbox with nav
- Processing/failed banners; click opens lightbox (Esc / backdrop close)

## Do / Don’t

- Do optimistic like/bookmark.
- Do confirm before delete.
- Don’t change feed pagination (Phase 10).
