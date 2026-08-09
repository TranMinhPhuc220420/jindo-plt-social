# Design: Guest, settings, admin (Phase 15)

- Phase: 15
- Status: Implemented
- Related: SRS §21, PROGRESS 15.A–15.F

## Goal

Brand guest/auth; polish settings and admin to match tokens.

## UX / pages

### Welcome

- One composition: brand name hero, one headline, one supporting line, Login + Register CTAs
- Remove Laravel Docs / Laracasts / Deploy blocks and stock art

### Auth

- Shared branded header/logo; social blue primary buttons
- Pages: login, register, forgot, reset, verify, confirm, 2FA

### Settings

- Keep settings sub-nav; denser fields; live avatar/cover preview before save

### Admin

- Same social tokens; tables remain utilitarian
- ConfirmDialog before suspend/unsuspend and delete post

### Global QA

Walk: feed, profile, post, messages, search, explore, bookmarks, notifications, settings, admin — light+dark, mobile width.
