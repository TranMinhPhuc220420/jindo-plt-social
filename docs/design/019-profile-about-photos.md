# Design: Rich profile (About + Photos)

- Phase: 20
- Status: Implemented
- Related: SRS §27, PROGRESS 20.A–20.H, ADR 0009

## Goal

Facebook-like richer profile: Intro sidebar, About tab, Photos grid, per-field privacy.

## UX / pages

### Profile show (`/u/{username}`)

- Wider main (~940px); hide Trending right rail.
- Header: cover, avatar, name, bio, actions, counts (unchanged).
- Tabs: **Posts** | **About** | **Photos**.
- Body (Posts tab): 2 columns on `md+` — left Intro card + photos preview (9), right post list. Stack on mobile.

### About (`/u/{username}/about`)

- Same header + tabs.
- Sections listing visible About fields (labels: Works at, Studied at, Lives in, From, Website, Birthday, Gender, Relationship).
- Owner: link to settings to edit.

### Photos (`/u/{username}/photos`)

- Grid of ready `post_media`; each links to post detail.
- Pagination (load more).

### Settings profile

- About section: value inputs + visibility select (`Public` / `Mutual followers` / `Only me`) per field.

## Data & APIs

- Columns on `users` + `profile_privacy` JSON.
- `ProfileAboutPresenter` filters by viewer.
- Photos: `PostMedia` status ready, parent post not soft-deleted, ordered newest.

## Do / Don’t

- Do omit unauthorized field values from props.
- Don’t invent albums, life events, or private accounts in this phase.
