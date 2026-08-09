# Design: Messages (Phase 14)

- Phase: 14
- Status: Implemented
- Related: SRS §20, PROGRESS 14.A–14.F

## Goal

Messenger-like inbox + thread.

## UX / pages

### Desktop

Split pane: left conversation list (~320px) | right thread. Opening `/messages/{id}` keeps list visible.

### Mobile

Full-width thread with back to inbox.

### Thread

- Bubbles (own vs other alignment)
- Timestamps; “Seen” on own last read
- Typing indicator above composer
- Composer: text + image; **Enter sends**, Shift+Enter newline

### Start conversation

- Profile Message button (Phase 11) preferred
- Inbox form: username + short note “You can message people who follow you back”
- Empty inbox EmptyState

## Data & APIs

Prefer existing mutual-follow gate; no protocol change.
