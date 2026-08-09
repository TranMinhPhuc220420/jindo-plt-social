# Handoff — Phase 19 Messages UX depth

- Date: 2026-08-09
- Spec: ADR 0008, SRS §26, design 018, PROGRESS Phase 19

## Shipped

- Full-width `app-messages-layout` (no Trending rail); wired for `messages/*` in `app.tsx`
- `GET /messages` → 302 to latest conversation; empty inbox when none; `?inbox=1` keeps list (mobile back)
- Thread auto-scroll + “New messages ↓”; composer autofocus/preview/disable empty
- Inbox search, unread_count, live preview bump on Echo

## Verify

```bash
php artisan test --filter=MessagingTest
npm run types:check
npm run lint:check
```

## Next

No active phase after 19 — await product direction for Phase 20+.
