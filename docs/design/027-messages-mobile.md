# Design: Messages mobile UX (Phase 29)

- Phase: 29
- Status: Implemented
- Related: SRS §36, ADR 0008 (amended), design 013 / 018 / 024, PROGRESS Phase 29

## Goal

Messenger-like mobile messaging: inbox first, immersive full-bleed thread, stable composer under the soft keyboard. Solid surfaces only (no liquid glass).

## Layout

### Inbox (`/messages?inbox=1`)

```
┌─────────────────────────────┐
│ Top bar                     │
├─────────────────────────────┤
│ Chats                  [✎]  │  title + PenSquare compose
│ 🔍 Search chats………          │  pill search (+ clear)
│ list rows…                  │
├─────────────────────────────┤
│ Home Explore [+] Msg Profile│  dock visible
└─────────────────────────────┘
```

- Shared `ConversationInbox` (title + compose + search + rows) on mobile index **and** desktop thread aside.
- Compose opens sheet (mobile) / dialog (desktop) — mutual-follow copy inside; no inline “Start chat @username” form.

### Thread (`/messages/{id}`) — `<md`

```
┌─────────────────────────────┐
│ ←  Avatar Name              │  sticky; no global TopBar
│     @user / typing…         │
├─────────────────────────────┤
│                             │
│   bubbles (scroll)          │
│                             │
├─────────────────────────────┤
│ [📎][😊][ Aa…… ][➤]         │  sticky composer + safe-area
└─────────────────────────────┘
```

- Hide `SocialTopBar` + mobile dock.
- Full-bleed: no outer card border/radius; no shell side padding.
- Back → `/messages?inbox=1`, ChevronLeft, ≥44px hit target.

### Desktop (`md+`)

Unchanged Phase 19: auto-open latest, split pane, top bar + left rail, card chrome.

## Composer / keyboard

- No autofocus on mobile when opening a thread; desktop keeps autofocus.
- Shell height tracks `visualViewport` (or `dvh`) so keyboard does not orphan the composer.
- Safe-area bottom padding when dock is hidden.

## Emoji

- `<md`: bottom Sheet (~50dvh), full width.
- `md+`: existing DropdownMenu picker.

## Do / Don’t

- Do keep mutual-follow gate and Phase 19 scroll/chip/cluster behavior.
- Don’t reintroduce glass/blur; don’t add group chat / reactions / infinite history.
