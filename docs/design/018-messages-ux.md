# Design: Messages UX depth (Phase 19)

- Phase: 19
- Status: Ready
- Related: SRS Phase 19, ADR 0008

## Layout

- `app-messages-layout`: SocialTopBar + SocialLeftRail + full-width main; **no** SocialRightRail.
- Wire `messages/index` + `messages/show` via `app.tsx` layout switch.

## Auto-open

- `ConversationController::index` → redirect to latest `updated_at` conversation when any exist.

## Scroll

- Bottom sentinel; auto-scroll if near bottom (~80px) or after own send.
- Re-pin to bottom when content height grows (e.g. images loading) while still near bottom (`ResizeObserver`).
- If scrolled up and new remote message → floating “New messages ↓”.

## Composer

- Compact row: attach icon · input · send icon (no how-to hints).
- Autofocus; image preview + clear; disable Send when empty/no file; Enter/Shift+Enter; refocus after send.

## Inbox list

- Client search filter; relative time; `unread_count` badge; live preview bump on Echo message.
- Start conversation form in sidebar (show) + empty index.

## Message clusters

- Consecutive messages from the **same sender** within **2 minutes** form one cluster.
- Tight `mt-0.5` inside a cluster; larger gap before a new cluster.
- Soften inner bubble corners so stacked bubbles read as one stream.
- Time / @username / Seen only on the **last** bubble of a cluster.
- Day chip (`Today` / `Yesterday` / date) when the calendar day changes.

## Do / Don’t

- Do keep mutual-follow gate.
- Don’t add group chat / reactions / infinite history in P19.
