# Design: Post reactions

- Phase: 24
- Status: Implemented
- Related: SRS §31, ADR 0010, PROGRESS 24.A–24.G

## Goal

Replace binary like with a seven-expression reaction control on PostCard (Facebook-style picker).

## Types

| Key | Label | Color |
|-----|-------|-------|
| like | Like | blue |
| love | Love | red |
| haha | Haha | yellow |
| sad | Sad | yellow |
| celebrate | Celebrate | orange |
| support | Support | purple |
| insightful | Insightful | gold |

Icons are custom colored SVG badges (`reaction-icons.tsx`), not system emoji.

## UX

- Action button: viewer reaction icon + label; community stack of up to **3** top reaction types (by count) + total when any exist.
- Short click: no reaction → set `like`; has reaction → remove.
- Desktop hover / mobile long-press (~380ms): floating glass picker with staggered SVG icons, hover lift + label tooltip, select spring + color burst.
- Reduced-motion: skip springs / bursts.

## Data & APIs

- `likes.type` + `ReactionType` enum.
- Post payload: `viewer_reaction`, `likes_count`, `reaction_counts` (all 7 keys).
- `POST`/`DELETE` `/posts/{post}/like` JSON as ADR 0010.

## Non-goals

Comment reactions, who-reacted modal, custom emoji, weighted explore ranking.
