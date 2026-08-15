# Handoff: Phase 40 Firebase-only DMs

- Date: 2026-08-15
- Phase: 40 (complete)
- Branch: current working tree

## Done this session

- 1:1 chat is durable on Firebase RTDB. MySQL `messages`, `conversation_participants`, and `conversations` are dropped (no history migrate).
- Conversation id is `{minUid}_{maxUid}`. Laravel `POST /messages/ensure` (mutual follow + Admin `members` map) and `POST /messages/media` (image URL only). Inertia shells do not hydrate messages.
- Client writes message + last_message + both inboxes; mark-read is RTDB (`read/{uid}` + `inbox.unread = 0`). Message badge = sum of inbox unread. Text send does not POST `/messages/{id}/messages`.
- Docs: ADR 0020, design 035, amend 0014/0019/0008, inventory, OPS, SRS/PROGRESS.

## In progress

- None (Phase 40 quality gate green).

## Not started / next

- **Deploy** `firebase/database.rules.json` (string cid, inbox, `read/{uid}`). Old numeric-cid rules will `permission_denied`.
- Group chat, server-side DM search, App Check, FCM — out of scope.
- Manual 2-browser QA: text with no persist POST; photo via `/messages/media`; inbox badge.

## Files touched

- `firebase/database.rules.json`, `database/migrations/2026_08_15_400001_drop_mysql_messaging_tables.php`
- `app/Support/ConversationId.php`, `ConversationService`, `ConversationController`, `MessageController`, `PostShareController`
- Dropped: `Conversation`/`Message` models, `MessageSent`, `MessageBroadcaster`, `UnreadMessageService`
- `resources/js/lib/realtime.ts`, messages pages/composer/inbox, `unread-badges-provider.tsx`
- Tests: `MessagingTest`, `MessageBroadcasterTest` (member sync), `ConversationIdTest`, share/emoji/polish

## How to verify

```bash
vendor/bin/pint --dirty
vendor/bin/phpstan analyse --memory-limit=512M
php artisan test
npm run types:check
npm run lint:check
php artisan migrate   # drops MySQL messaging tables
firebase deploy --only database
```

Two browsers, mutual followers: send text (Network has no `POST /messages/{cid}/messages`); peer bubble &lt;1s; open thread clears badge.

## Risks / watchouts

- Existing MySQL DM history is gone after migrate.
- Chat needs `VITE_FIREBASE_*` locally even if `BROADCAST_CONNECTION=reverb` (notifications can still use Reverb).
- `ensure` must succeed (members map) before the client can write messages.
