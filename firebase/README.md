# Firebase Realtime Database

Security rules live in [`database.rules.json`](./database.rules.json).

MySQL remains the source of truth for users, follows, and posts. RTDB under `realtime/` is:

- **Durable 1:1 DMs** (`conversations/{minUid}_{maxUid}/…` + `users/{uid}/inbox`) — [ADR 0020](../docs/decisions/0020-firebase-durable-dms.md)
- **Event bus** for notification badges and the bell — [ADR 0014](../docs/decisions/0014-firebase-realtime-event-bus.md)

Inventory: [`docs/architecture/realtime-inventory.md`](../docs/architecture/realtime-inventory.md).

## Deploy rules

**Required after Phase 40** — string conversation ids, client inbox/read writes, member-only Admin `members` map. Old numeric-cid rules will `permission_denied`.

```bash
# With Firebase CLI (project already selected)
firebase deploy --only database
```

Or paste `database.rules.json` into the Firebase Console → Realtime Database → Rules.

## Service account (cPanel)

1. Create a service account with Firebase Admin privileges; download JSON.
2. Upload **outside** `public_html` (e.g. `~/firebase/service-account.json`).
3. `chmod 600` the file.
4. Point `FIREBASE_CREDENTIALS` at the absolute path in production `.env`.

Never commit the service account JSON.
