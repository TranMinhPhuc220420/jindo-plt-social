# Handoff: Client-only DM RTDB

- Date: 2026-08-15
- Phase: 39
- Branch: (working tree)

## Done this session

- Laravel no longer Admin-writes `messages/*` or `last_message` on the Firebase driver (`MessageBroadcaster::publishSent` no-op; `FirebaseBroadcaster` ignores `message.sent`).
- Text: client RTDB then POST persist (unchanged). Image: POST then client RTDB with `image_url`. Share-to-DM: JSON `{ messages }` then client write per conversation.
- Rules forbid client `mysql_id`. Reverb still broadcasts `MessageSent`.

## In progress

- None.

## Not started / next

- Redeploy `firebase/database.rules.json`.
- Manual 2-browser: text before POST 201; photo after JSON via client write (no Admin REST to `messages/`).

## Files touched

- `app/Services/Messaging/MessageBroadcaster.php`, `app/Broadcasting/FirebaseBroadcaster.php`, `app/Http/Controllers/PostShareController.php`
- `resources/js/lib/realtime.ts`, `message-composer.tsx`, `share-to-message-dialog.tsx`
- ADR 0019, design 034, inventory, OPS

## How to verify

```bash
php artisan test --compact tests/Feature/Messages tests/Unit/FirebaseBroadcasterTest.php tests/Feature/Posts/PostShareTest.php
npm run types:check
npm run lint:check
```

## Risks / watchouts

- Share dialog now uses `fetch` JSON, not Inertia `router.post`.
- Members map still Admin SDK on create/open — required for rules.
