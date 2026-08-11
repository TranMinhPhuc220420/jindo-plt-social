# Operator runbook — PLT Social (cPanel)

Deploy and operate production **without reading Laravel source**. CI builds a release zip and uploads it via FTPS; you extract and finish setup in cPanel.

**Product:** PLT Social (`jindo-plt-social`)  
**Hosting:** cPanel shared (PHP 8.4 / `ea-php84`)

---

## Quick reference

| Task | Command / note |
|------|----------------|
| Local gate before push | `make pre-commit` (alias: `make pre-deploy`) |
| Health | `GET {APP_URL}/up` |
| Migrate | `php artisan migrate --force` |
| Storage symlink | `php artisan storage:link` |
| Cache | `php artisan config:cache && php artisan route:cache && php artisan view:cache` |
| Queue (database driver) | `php artisan queue:work --tries=3` or Cron `--stop-when-empty` |
| Failed jobs | `php artisan queue:failed` → `php artisan queue:retry all` |
| Horizon / Reverb / Redis | **Do not use on shared cPanel** — see §5 |

---

## 0. GitHub secrets (one-time)

Repo → **Settings → Secrets and variables → Actions**. Required by [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml):

| Secret | Example / note |
|--------|----------------|
| `FTP_HOST` | Host from cPanel FTP Accounts (often the domain or IP) |
| `FTP_USERNAME` | Full FTP user |
| `FTP_PASSWORD` | FTP password |
| Protocol | Workflow uses **FTPS** on port **21** |
| `server-dir` | Workflow sends `/` — must be the FTP account home where you want `deploy.zip` (often account root; confirm in File Manager after first upload) |

If `deploy.zip` lands in the wrong folder, fix the FTP account home or change `server-dir` in the workflow (do not put the zip inside a live `public_html` tree blindly).

**cPanel PHP:** MultiPHP Manager → select **PHP 8.4** for the domain. Root [`htaccess`](../htaccess) ships the ea-php84 handler and rewrites into `/public`.

---

## 1. Developer loop (every release)

```bash
make pre-commit   # or: make pre-deploy
git add -A && git commit -m "…"
git push origin main
```

1. Wait for **CI / Deploy** on `main` (PR runs CI only; deploy runs on push to `main`).
2. In cPanel **File Manager**, confirm a new `deploy.zip` at the FTP target.
3. Follow §2 (first deploy) or §3 (update).

CI already includes `vendor/` (Composer `--no-dev`) and `public/build/` (Vite). Do **not** run `npm install` on the server.

---

## 2. First deploy checklist

1. **MySQL** — create database + user in cPanel; note host (often `localhost`), name, user, password.
2. **Upload / extract** — extract `deploy.zip` into the app directory (document root = app root that contains `public/` and root `.htaccess`, **or** point the subdomain to that folder).
3. **`.env` on the server only** — copy from `.env.example`, then set **cPanel-safe** values (never commit `.env`):

   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-domain.example

   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=…
   DB_USERNAME=…
   DB_PASSWORD=…

   CACHE_STORE=database
   QUEUE_CONNECTION=database
   BROADCAST_CONNECTION=firebase
   FIREBASE_CREDENTIALS=/home/USER/firebase/service-account.json
   FIREBASE_DATABASE_URL=https://YOUR_PROJECT.firebaseio.com
   FIREBASE_PROJECT_ID=YOUR_PROJECT
   MEDIA_DISK=public
   SESSION_DRIVER=database
   LOG_LEVEL=error
   ```

   Build the release with `VITE_FIREBASE_*` set so the client can listen (see §5).

4. **App key** (if `APP_KEY` empty):

   ```bash
   php artisan key:generate --force
   ```

5. **Migrate + link + cache:**

   ```bash
   php artisan migrate --force
   php artisan storage:link
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

6. **Admin user** — do **not** run `db:seed` on production (demo seeder is local-only). Create a user (register or tinker), then set `role` to `admin` (see `UserRole::Admin` / `User::isAdmin()`).
7. **Queue** — configure §5 before testing media uploads.
8. **Smoke** — §7.

Permissions: `storage/` and `bootstrap/cache/` must be writable by the web user.

---

## 3. Update deploy checklist

1. **Backup** — rename previous `deploy.zip` (e.g. `deploy-prev.zip`) and note DB backup if migrations are non-trivial.
2. **Extract without clobbering runtime data:**
   - Prefer extract to a temp folder, then copy **code** over the live tree; **do not overwrite** server `.env` or `storage/app/public/` (user media).
   - CI zip intentionally omits `.env*`, local symlinks, and storage upload contents — still be careful with “Replace all” in File Manager.
3. **Migrate:**

   ```bash
   php artisan migrate --force
   ```

4. **Recache:**

   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

5. **Queue restart** (long-running worker) or rely on Cron `--stop-when-empty` to pick up new code next minute:

   ```bash
   php artisan queue:restart
   ```

6. **Smoke** — §7.

---

## 4. Document root & `.htaccess`

- App layout expects Laravel `public/` as the web front controller.
- Root `.htaccess` (from `htaccess` in the repo) rewrites non-`/public/` requests into `/public/` and sets ea-php84.
- If the host requires docroot = `public/` only, set the subdomain document root to `…/public` and you may omit the root rewrite — keep `public/.htaccess`.

---

## 5. Queue, cache, realtime (cPanel shared)

| Concern | Production choice | Why |
|---------|-------------------|-----|
| Cache | `CACHE_STORE=database` | No Redis on typical shared hosting |
| Queue | `QUEUE_CONNECTION=database` | Same; required for `ProcessPostMediaJob` |
| Worker | Cron or Terminal `queue:work` | No Supervisor → prefer Cron below |
| Horizon | **Off** | Needs Redis + long process |
| Broadcast | `BROADCAST_CONNECTION=firebase` | Reverb needs a persistent WebSocket process; Firebase RTDB is the event bus |
| Realtime UX | Firebase RTDB listeners | MySQL remains source of truth — see [realtime-inventory.md](./architecture/realtime-inventory.md) |

### Firebase checklist (one-time + every env change)

1. Create a Firebase project with **Realtime Database**; deploy rules from [`firebase/database.rules.json`](../firebase/database.rules.json) (see [`firebase/README.md`](../firebase/README.md)).
2. Download a service account JSON; place **outside** `public_html` (e.g. `~/firebase/service-account.json`); `chmod 600`.
3. Server `.env`:

   ```env
   BROADCAST_CONNECTION=firebase
   FIREBASE_CREDENTIALS=/home/USER/firebase/service-account.json
   FIREBASE_DATABASE_URL=https://YOUR_PROJECT.firebaseio.com
   FIREBASE_PROJECT_ID=YOUR_PROJECT
   ```

4. CI / Vite build must include `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` so `public/build` can sign in and listen.
5. **Members map:** Security Rules require `realtime/conversations/{id}/members/{userId}: true` for both participants. Opening a DM or sending a message syncs this automatically. If peer chat does not update live, check the RTDB console for that path (and browser console for `permission_denied`).
6. Smoke: two browsers — send DM (sender optimistic; peer gets Firebase event), typing indicator, like a post (bell +1), open thread (badge decreases).
7. If Firebase is unavailable, HTTP still succeeds (fail-soft); UI may need refresh.

Capability list (add/remove realtime features here): [architecture/realtime-inventory.md](./architecture/realtime-inventory.md). ADR: [decisions/0014-firebase-realtime-event-bus.md](./decisions/0014-firebase-realtime-event-bus.md).

**Cron (recommended on shared):** every minute:

```cron
* * * * * cd /home/USER/path/to/app && php artisan queue:work --stop-when-empty --tries=3 --max-time=50 >> /dev/null 2>&1
```

**Terminal (smoke / short test):**

```bash
php artisan queue:work --tries=3
```

Verify drain:

```bash
php artisan tinker --execute="echo DB::table('jobs')->count();"
```

After uploads, count should return toward `0` if the worker is healthy.

---

## 6. Rollback

1. Keep the previous `deploy.zip` (or file tree backup).
2. Restore previous code (extract previous zip with the same “don’t overwrite `.env` / media” rule).
3. Only roll back DB if a migration is not backward-compatible (restore DB dump).
4. Recache (§3 step 4) and `queue:restart`.

---

## 7. Smoke test (first deploy & every release)

| Check | Expect |
|-------|--------|
| `GET /up` | 200 |
| Home / login / register | Pages render; no 500 |
| Login as admin | Dashboard / admin gates work |
| Create a post **with image** | Job leaves `jobs` table; image visible (needs queue worker + `storage:link`) |
| Avatar / cover upload | Same as media |
| Live DM (2 sessions) | Sender: optimistic bubble immediately; receiver: Firebase without full page reload |
| Notification bell | Like/follow bumps badge live when Firebase configured |
| `APP_DEBUG=false` | No stack traces to public users |
| Wrong FTP path | Fixed if site 404 after extract — confirm extract path vs subdomain docroot |

---

## 8. Local `.env.production` (developer machine)

`.env.production` is **gitignored**. Use it as a personal template mirroring server drivers (`production` / `database` / `log`). Copy values onto the **server** `.env` via File Manager or SSH — never commit secrets.

See comments in [`.env.example`](../.env.example) under “cPanel production drivers”.
