# Handoff — Phase 21 Notification badge effectiveness

- Date: 2026-08-09
- Spec: SRS §28, design 020, PROGRESS Phase 21 (complete)

## Shipped

- `UnreadBadgesProvider` at social chrome — single unread source for bell, left rail, mobile nav; resyncs from Inertia `auth.unread_*`
- Echo `.notification` + `.unread.badges` (`UnreadBadgesUpdated`) keep notification and DM badges live
- Mark-as-read on bell row + notifications index link before navigate
- Unified `bg-destructive`, `9+`, accessible unread names

## Verify

```bash
php artisan test --filter='NotificationTest|MessagingTest|Phase4PolishTest'
npm run types:check
npm run lint:check
```

## Next

Badge revive fixed (history + root provider). No active phase after 21 — await product direction for Phase 22+.
