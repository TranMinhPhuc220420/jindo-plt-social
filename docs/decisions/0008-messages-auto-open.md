# ADR 0008: Messages auto-open + full-width shell

- Status: Accepted (amended Phase 29)
- Date: 2026-08-09
- Amended: 2026-08-09 (Phase 29 — mobile inbox-first)

## Context

Phase 14 shipped Messenger-like split pane, but `/messages` only shows an inbox list, the center column is capped at ~680px, and the right rail (Trending tags) wastes space. Users want to land in the latest chat immediately and use the full width for messaging.

Phase 29: on **mobile**, auto-open skips the inbox and makes switching chats hard (dock → latest thread only). Messenger / iMessage land on the conversation list first.

## Decision

1. **`GET /messages`**: if the user has any conversations, **302 redirect** to the conversation with the latest `updated_at`; otherwise render the empty inbox Inertia page.
2. **`GET /messages?inbox=1`**: always render the inbox Inertia page (no redirect). Used by the **mobile dock** Messages tab and thread Back.
3. **Messages layout**: dedicated shell — top bar + left rail, **no right rail**, main column **full width** (no `max-w-[680px]`).
4. Phase **19** covers scroll-to-latest, composer polish, unread badges, and inbox search.
5. Phase **29**: mobile immersive thread (hide top bar + dock), shared conversation list, composer/keyboard and emoji sheet polish. Desktop auto-open (1) unchanged.

## Consequences

- Desktop / left-rail “Messages” still opens the latest thread when chats exist.
- Mobile dock opens inbox (`?inbox=1`); Back from a thread returns to inbox.
- Empty users still see EmptyState + start-conversation entry.
- Mutual-follow DM gate unchanged.

## Alternatives considered

- Client-only redirect after loading index — rejected; server redirect is simpler and avoids flash.
- Keep 680px center — rejected; too narrow for split pane.
- Remove auto-open entirely — rejected; desktop split-pane still benefits from landing in a thread.
- User-Agent sniffing for mobile redirect skip — rejected; viewport-aware nav + `?inbox=1` is reliable.
