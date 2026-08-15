# Design: Guest, settings, admin (Phase 15)

- Phase: 15
- Status: Implemented
- Related: SRS §21, PROGRESS 15.A–15.F

## Goal

Brand guest/auth; polish settings and admin to match tokens.

## UX / pages

### Welcome

- One composition: brand name hero, one headline, one supporting line
- Guest CTA is **Log in** while public registration is off (`canRegister`); Sign up / Create account only when `FORTIFY_PUBLIC_REGISTRATION=true`
- Remove Laravel Docs / Laracasts / Deploy blocks and stock art

### Auth

- Shared branded header/logo; social blue primary buttons
- Pages: login, register (or closed page), forgot, reset, verify, confirm, 2FA
- Public self-register is off by default (ADR 0015); GET `/register` explains that an administrator creates accounts

### Settings

- Keep settings sub-nav; denser fields; live avatar/cover preview before save

### Admin

- **Console shell** (Phase 31): dedicated sidebar layout, not the social 680px chrome — see [`028-admin-console-layout.md`](./028-admin-console-layout.md)
- ConfirmDialog before suspend/unsuspend and delete post
- **Create user** dialog on `/admin/users` (name, username, email, temporary password)

### Global QA

Walk: feed, profile, post, messages, search, explore, bookmarks, notifications, settings, admin — light+dark, mobile width.
