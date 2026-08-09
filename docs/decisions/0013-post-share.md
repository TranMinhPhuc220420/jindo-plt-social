# ADR 0013: Facebook-like post share

- Status: Accepted
- Date: 2026-08-09

## Context

Phases 1–27 shipped posts, reactions, comments, bookmarks, and DMs. Product needs Facebook-style Share: to own feed (quote), copy link, and send via Messages. Quote-repost was previously out of scope (Phase 6/7); Phase 28 adopts it.

## Decision

1. **Feed share** is a normal `posts` row with nullable `shared_post_id` pointing at the **root** original. Sharing a share flattens to that root (one embed level).
2. Caption may be empty (`body = ''`); no media uploads on share posts. Mentions/hashtags sync on caption only.
3. **Copy link** is client-only: absolute `/posts/{rootId}`.
4. **DM share** adds `messages.shared_post_id`; `POST /posts/{post}/share-message` with mutual-follow recipients (1–10). No AppNotification for DM share (unread badge path only).
5. Notify original author on **feed share only** (`post_shared`), not self, not Copy/DM.
6. Soft-deleted / missing root → presenter exposes `shared_post.unavailable`; UI shows unavailable copy. FK uses `nullOnDelete` for hard deletes.

## Consequences

- Feed/profile payloads gain `shares_count` + nested `shared_post`.
- Message bubbles can render a shared-post embed.
- Edit share = caption only; cannot change `shared_post_id` or add images.

## Alternatives considered

- Separate `shares` table — rejected; share is a first-class timeline post.
- Deep nested share chains — rejected; flatten like Facebook.
- Body-only URL paste for DM — rejected; rich embed needs FK.
