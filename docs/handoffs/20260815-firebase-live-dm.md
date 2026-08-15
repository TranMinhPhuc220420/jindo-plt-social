# Handoff: Firebase live DM cache

- Date: 2026-08-15
- Phase: 38
- Branch: (working tree)

## Done this session

- Text DMs (Firebase driver) write the full payload to RTDB `messages/{pushId}` + `last_message` before POST. Receiver listens with `onChildAdded` (`limitToLast(100)`).
- MySQL persist accepts `client_uuid` (idempotent). Laravel no longer syncs members on send. `MessageSent` publishes the same append path (images / share-to-DM / Reverb).
- Security Rules allow members to create/update/delete **their** message nodes. **Deploy rules** or live writes `permission_denied`.

## In progress

- None.

## Not started / next

- Deploy `firebase/database.rules.json` (`firebase deploy --only database`).
- Manual 2-browser QA: text A→B bubble before POST 201; persist fail removes both bubbles.
- Optional: TTL prune of RTDB message tails; unread badge still afterResponse.

## Files touched

- `firebase/database.rules.json`, `app/Broadcasting/FirebaseBroadcaster.php`, `app/Services/Messaging/MessageBroadcaster.php`, `app/Http/Controllers/MessageController.php`
- `resources/js/lib/realtime.ts`, `resources/js/components/messages/message-composer.tsx`, `resources/js/pages/messages/show.tsx`
- ADR 0019, design 034, inventory, OPS

## How to verify

```bash
php artisan test --compact tests/Feature/Messages tests/Unit/FirebaseBroadcasterTest.php
npm run types:check
npm run lint:check
```

Two browsers, `BROADCAST_CONNECTION=firebase`, rules deployed: send text; peer sees body from RTDB in &lt;1s.

## Risks / watchouts

- Old RTDB rules block client writes. Production must redeploy rules.
- Reverb path is HTTP + Echo only (no client RTDB write).
