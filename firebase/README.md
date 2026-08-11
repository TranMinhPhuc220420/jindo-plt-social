# Firebase Realtime Database

Security rules for the PLT Social event bus live in [`database.rules.json`](./database.rules.json).

MySQL remains the source of truth. RTDB paths under `realtime/` are ephemeral UI events only — see [`docs/architecture/realtime-inventory.md`](../docs/architecture/realtime-inventory.md).

## Deploy rules

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
