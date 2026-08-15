# Design: Admin console layout

- Phase: 31
- Status: Implemented
- Related: SRS Phase 31, ADR 0006 (amended), PROGRESS 31.A–31.D

## Goal

Give `/admin/*` a console shell that is **not** the social feed chrome (680px column, top bar, dock, FAB). Admins need full-width tables, breadcrumbs, and a dedicated sidebar.

## UX / pages

### Shell

- Inertia layout branch: `admin/*` → `AdminLayout` (no `UnreadBadgesLayout`)
- Inset shadcn sidebar: Dashboard, Users, Posts, Failed jobs, Horizon (new tab), Back to app (`/feed`)
- Header: sidebar trigger + breadcrumbs; no notification bell
- Main: full width, internal scroll

### Dashboard

- Community cards (Users, Suspended, Posts) and Activity 7d cards
- Clickable cards go to Users or Posts; Ops card opens Failed jobs

### Tables

- Users / Posts: search `?q=`, status/role badges, Prev/Next pagination
- Failed jobs: table + pagination (no search)
- Create user / suspend / delete post unchanged

## Data & APIs

- `GET /admin/users?q=` filters name, username, email (`LIKE`)
- `GET /admin/posts?q=` filters body or author name/username
- Paginators use `withQueryString()`

## Open questions

None for this pass.
