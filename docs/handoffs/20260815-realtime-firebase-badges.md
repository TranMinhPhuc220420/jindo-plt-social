# Handoff: Realtime Firebase badges

- Date: 2026-08-15
- Phase: 37
- Branch: (working tree)

## Done this session

- Diagnosed local mismatch: `BROADCAST_CONNECTION=firebase` with empty Admin SDK and empty `VITE_FIREBASE_*` (Laravel no-ops Firebase; leftover Echo cannot receive those publishes).
- Client now listens using Inertia `realtime.driver` (must match server). Firebase client requires `VITE_FIREBASE_DATABASE_URL`. Token mint waits for `authStateReady` and retries 503/network.
- `UnreadBadgeBroadcaster` always publishes both unread counts. `NotificationSent` (database channel) and mark-read paths use it. Badge `onValue` is the count source; notification events only prepend the bell (deduped).
- `listenForNewValue` keeps a first snapshot if `at`/`created_at` is within 3s (auth race).
- Inertia `success` is decrease-only after first mount so nav prefetch cannot wipe live bumps.

## In progress

- None.

## Not started / next

- Fill local Firebase Admin + `VITE_FIREBASE_*` **or** set `BROADCAST_CONNECTION=reverb` and run `php artisan reverb:start`.
- Production: confirm `/firebase/token` 200, RTDB rules deployed, and CI baked `VITE_FIREBASE_DATABASE_URL`.
- Manual 2-browser QA in `docs/design/020-notification-badges.md`.

## Files touched

- `app/Services/UnreadBadgeBroadcaster.php`, `app/Listeners/BroadcastUnreadBadgesOnNotification.php`
- `app/Events/UnreadBadgesUpdated.php`, `app/Broadcasting/FirebaseBroadcaster.php`
- `resources/js/lib/realtime.ts`, `firebase-auth.ts`, `firebase.ts`
- `resources/js/components/notifications/unread-badges-provider.tsx`

## How to verify

```bash
php artisan test --compact
npm run types:check
npm run lint:check
```

Two browsers, no reload: like a post, send a DM, hover-prefetch Home then receive a notification.

## Risks / watchouts

- Local `.env` still has `BROADCAST_CONNECTION=firebase` without credentials — live badges will stay dead until env is aligned.
