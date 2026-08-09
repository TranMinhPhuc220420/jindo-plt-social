# Design: Post share (Facebook-like)

- Phase: 28
- Status: Implemented
- Related: SRS §35, ADR 0013, PROGRESS 28.A–28.H

## Goal

Share menu on every PostCard: Share to Feed, Send in Messages, Copy link — matching Facebook destinations available in this product (no Groups/Stories).

## UX

### Share entry

- Action bar: Share icon (`Share2`) + optional `shares_count` after Bookmark.
- Opens menu: Share to Feed | Send in Messages | Copy link.

### Share to Feed

- Dialog title “Share”.
- Textarea: “Say something about this…” — empty allowed; Post always enabled (no media).
- Emoji picker; compact read-only `SharedPostEmbed` of root.
- Success → feed + toast.

### SharedPostEmbed

- Nested bordered card: avatar, name, clamped body, media thumb.
- Click → `/posts/{rootId}`.
- Unavailable: “This content isn’t available right now.”

### Copy link

- Clipboard absolute root URL; toast “Link copied.”

### Send in Messages

- Dialog: search mutual followers, multi-select ≤10, optional note.
- Empty mutuals: EmptyState “Follow each other to send messages.”
- Thread bubble: note text + SharedPostEmbed; inbox preview “Shared a post”.

## Data & APIs

| Endpoint | Role |
|----------|------|
| `POST /posts/{post}/share` | Feed share; optional `body` |
| `POST /posts/{post}/share-message` | DM share; `usernames[]`, optional `body` |
| `GET /share-recipients?q=` | JSON mutual followers for picker |

Payload: `shares_count`, `shared_post: { id, body, media, user, unavailable } | null`.

## Non-goals

Who-shared modal, Groups/Stories, external share sheets, nested multi-level embeds.
