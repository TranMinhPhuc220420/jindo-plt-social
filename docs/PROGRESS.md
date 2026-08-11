# PLT Social — Phase Progress

> **Source of truth for implementation status.**  
> Spec details live in [`SRS.md`](./SRS.md). Agents must update this file when starting or finishing work (see `.cursor/rules/phase-progress.mdc`).

## Status legend

| Marker | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done (accepted for this phase) |
| `[!]` | Blocked / needs human decision |

---

## Current focus

| Field | Value |
|-------|--------|
| **Active phase** | `—` |
| **Active item** | `—` |
| **Last updated** | `2026-08-11` |
| **Last note** | Firebase RTDB event bus (MySQL SoT) for cPanel realtime; inventory in `docs/architecture/realtime-inventory.md`. |

---

## Phase overview

- [x] **Phase 1** — Core foundation & social graph (MVP)
- [x] **Phase 2** — Engagement & real-time
- [x] **Phase 3** — Advanced features & performance
- [x] **Phase 4** — Hardening & product readiness
- [x] **Phase 5** — Engagement depth
- [x] **Phase 6** — Hashtags & topic discovery
- [x] **Phase 7** — Ops: FULLTEXT + media disk + Horizon
- [x] **Phase 8** — UX foundation (tokens, chrome, primitives)
- [x] **Phase 9** — Core post unit
- [x] **Phase 10** — Home feed UX
- [x] **Phase 11** — Profile & follow lists
- [x] **Phase 12** — Engagement surfaces UX
- [x] **Phase 13** — Discovery UX
- [x] **Phase 14** — Messaging UX
- [x] **Phase 15** — Guest, auth, settings, admin polish
- [x] **Phase 16** — Motion foundation
- [x] **Phase 17** — Motion interactions
- [x] **Phase 18** — Motion showcase
- [x] **Phase 19** — Messages UX depth
- [x] **Phase 20** — Rich profile (About + Photos + privacy)
- [x] **Phase 21** — Notification badge effectiveness
- [x] **Phase 22** — Emoji picker + large emoji stickers
- [x] **Phase 23** — Modern post create/edit (hybrid dialog)
- [x] **Phase 24** — Post reactions (multi-expression)
- [x] **Phase 25** — Mobile liquid glass foundation
- [x] **Phase 26** — Mobile liquid glass chrome
- [x] **Phase 27** — Mobile glass overlays + page walk
- [x] **Phase 28** — Facebook-like share post
- [x] **Phase 29** — Messages mobile UX

---

## Phase 29 — Messages mobile UX

- [x] 29.A Docs (ADR 0008 amend, design 027, SRS)
- [x] 29.B Entry (mobile dock `?inbox=1`, Back chevron)
- [x] 29.C Immersive shell (hide top bar, full-bleed)
- [x] 29.D Shared ConversationList + New message sheet
- [x] 29.E Composer + keyboard (no mobile autofocus, visualViewport)
- [x] 29.F Emoji bottom Sheet on mobile
- [x] 29.G Quality gate

## Phase 28 — Facebook-like share post

- [x] 28.A Docs (ADR 0013, design 026, SRS)
- [x] 28.B Schema + model relations + shareRoot
- [x] 28.C Share-to-feed API + presenter + FeedService
- [x] 28.D PostSharedNotification + bell UI
- [x] 28.E FE: Share menu, dialogs, embed, Copy link
- [x] 28.F DM share API + recipients + ShareToMessageDialog + thread embed
- [x] 28.G Edit/delete edges + shares_count
- [x] 28.H Quality gate

## Phase 25 — Mobile liquid glass foundation

- [x] 25.A Docs (ADR 0012, design 024, SRS)
- [x] 25.B Glass tokens + utilities + fallbacks
- [x] 25.C `GlassSurface` primitive
- [x] 25.D Quality gate

## Phase 26 — Mobile liquid glass chrome

- [x] 26.A Floating glass top bar (mobile)
- [x] 26.B Floating glass dock + Create FAB
- [x] 26.C Create-post provider
- [x] 26.D Shell padding + hide dock on message thread
- [x] 26.E Quality gate

## Phase 27 — Mobile glass overlays + page walk

- [x] 27.A Dialog / confirm glass (mobile)
- [x] 27.B Composer mobile glass sheet feel
- [x] 27.C Reaction picker tokens
- [x] 27.D Page walk checklist (feed→admin)
  - [x] Feed / post detail / profile* / messages / notifications
  - [x] Explore / search / tags / bookmarks
  - [x] Welcome / auth / settings
  - [x] Admin confirms (shared Dialog glass)
- [x] 27.E Quality gate

---

## Phase 1 — Core foundation & social graph

### 1.A Schema & domain

- [x] Extend `users`: `username`, `bio`, `avatar_path`, `cover_path`, `role`
- [x] Migration + model: `posts` (body, optional `image_path`, soft deletes)
- [x] Migration + relations: `follows` (unique pair, no self-follow)
- [x] Factories & seeders for users / posts / follows

### 1.B Auth & profile fields

- [x] Register requires unique `username`
- [x] Settings / profile update: username, bio, avatar, cover
- [x] Basic RBAC via `role` (`user` \| `admin`)

### 1.C Posts CRUD

- [x] Create post (body required, max 2000; optional single image)
- [x] Edit / delete own posts (`PostPolicy`)
- [x] Admin can delete any post
- [x] Profile post list paginated

### 1.D Follow graph

- [x] Follow / unfollow endpoints + UI
- [x] Followers / following counts on profile
- [x] Followers / following lists (page or modal)

### 1.E Newsfeed

- [x] `FeedService`: self + following, newest first, eager load, no N+1
- [x] Pagination (15; prefer cursor)
- [x] Inertia Home/Feed page; nav updated (replace placeholder dashboard)

### 1.F Public profile & admin (minimal)

- [x] Public profile page `/u/{username}`
- [x] Minimal admin: list users, disable/suspend, delete posts

### 1.G Quality gate (Phase 1 exit)

- [x] Pest coverage for username, follow constraints, feed, post auth
- [x] Pint / PHPStan / frontend lint+types clean for touched code
- [x] Phase 1 acceptance checklist in SRS §4.6 satisfied

---

## Phase 2 — Engagement & real-time

### 2.A Likes

- [x] `likes` table + unique `(user_id, post_id)`
- [x] Like / unlike without full page reload
- [x] Like count on posts

### 2.B Comments

- [x] `comments` table with one-level `parent_id`
- [x] Add / delete comments (policies)
- [x] Comment count + UI (detail or expandable)

### 2.C Notifications + Reverb

- [x] DB notifications: follow, like, comment (no self-notify)
- [x] Notification bell / list + mark read
- [x] Laravel Reverb + Echo; private user channel broadcasts

### 2.D Quality gate (Phase 2 exit)

- [x] Pest + smoke for like/comment/notify
- [x] Phase 2 acceptance checklist in SRS §5.5 satisfied

---

## Phase 3 — Advanced features & performance

### 3.A Media

- [x] `post_media` (multi-image carousel; max 6)
- [x] Queued resize/compress jobs (Redis queue recommended)
- [x] Upload / processing UX

### 3.B Direct messaging

- [x] Conversations + messages (mutual-follow gate)
- [x] Realtime send via Reverb
- [x] Typing indicators + read receipts
- [x] Inbox + thread UI

### 3.C Search & explore

- [x] User search by name / username
- [x] Explore trending (24–48h likes+comments score)

### 3.D Performance

- [x] Indexes on hot columns
- [x] Redis feed/cache where documented
- [x] N+1 / payload review

### 3.E Quality gate (Phase 3 exit)

- [x] Phase 3 acceptance checklist in SRS §6.4 satisfied

---

## Phase 4 — Hardening & product readiness

### 4.A Spec & tracking

- [x] SRS Phase 4 + PROGRESS + ADR + module-map

### 4.B Security

- [x] Named rate limiters on posts/comments/follows/messages
- [x] Admin audit log for suspend / delete post

### 4.C Ops & observability

- [x] S3 / Redis runbook + `.env.example` notes
- [x] Failed jobs admin visibility
- [x] Structured log context on queue/broadcast failures

### 4.D Admin analytics

- [x] Minimal admin dashboard (counts)

### 4.E Product polish

- [x] Unread DM badge (shared Inertia prop)
- [x] Remove media on post edit UI

### 4.F Quality gate (Phase 4 exit)

- [x] CI green + Phase 4 acceptance checklist in SRS

---

## Phase 5 — Engagement depth

### 5.A Spec & tracking

- [x] SRS Phase 5 + PROGRESS + ADR + design + module-map

### 5.B Bookmarks

- [x] `bookmarks` table + JSON toggle
- [x] `/bookmarks` page + sidebar + presenter flag

### 5.C Mentions

- [x] Parse/sync `@username` on posts/comments
- [x] Notify + FE linkify

### 5.D Post search

- [x] Search tab for posts (`body LIKE`)

### 5.E Quality gate (Phase 5 exit)

- [x] Phase 5 acceptance checklist in SRS satisfied

---

## Phase 6 — Hashtags & topic discovery

### 6.A Spec & tracking

- [x] SRS Phase 6 + PROGRESS + ADR + design + module-map

### 6.B Schema + sync

- [x] `tags` + `post_tag` + HashtagService on posts

### 6.C Surfaces

- [x] `/t/{slug}` tag page
- [x] Explore trending tags (7d)
- [x] Search `tab=tags`

### 6.D FE linkify

- [x] `#tag` + `@user` rich-text rendering

### 6.E Quality gate (Phase 6 exit)

- [x] Phase 6 acceptance checklist in SRS satisfied

---

## Phase 7 — Ops: FULLTEXT + media disk + Horizon

### 7.A Spec & tracking

- [x] SRS Phase 7 + PROGRESS + ADR + design + module-map

### 7.B FULLTEXT post search

- [x] Driver-gated FULLTEXT + SearchService branch

### 7.C Media disk (S3)

- [x] `MEDIA_DISK` + rewrite callers + S3-safe ProcessPostMediaJob

### 7.D Horizon

- [x] Install Horizon + admin Gate + runbook

### 7.E Quality gate (Phase 7 exit)

- [x] Phase 7 acceptance checklist in SRS satisfied

---

## Phase 8 — UX foundation (tokens, chrome, primitives)

### 8.A Design tokens

- [x] Social blue primary + denser spacing + like-active (light/dark)

### 8.B App chrome

- [x] Social layout: sticky top bar + left rail + center column

### 8.C Nav items

- [x] Home, Profile, Messages, Notifications, Explore, Search, Saved, Admin; badges; no “Platform”

### 8.D Right rail shell

- [x] Optional right rail placeholder slot

### 8.E Shared UX primitives

- [x] EmptyState, PostSkeleton, ConfirmDialog

### 8.F Breadcrumbs

- [x] Hide/minimize on social surfaces

### 8.G Quality gate (Phase 8 exit)

- [x] Chrome on sample pages; mobile; lint/types; SRS §14.3

---

## Phase 9 — Core post unit

### 9.A PostCard

- [x] Header + body + action bar Like/Comment/Save + overflow

### 9.B Like / Bookmark

- [x] Optimistic filled states + counts

### 9.C Composer

- [x] Avatar + expand + char hint

### 9.D Media upload

- [x] Preview grid max 6

### 9.E Media carousel

- [x] Dots/arrows + processing banners + lightbox

### 9.F Post edit form

- [x] Consistent with composer; confirm delete

### 9.G Quality gate (Phase 9 exit)

- [x] SRS §15.3; lint/types

---

## Phase 10 — Home feed UX

### 10.A Feed layout

- [x] Center column; composer top; dense list

### 10.B Empty feed

- [x] EmptyState + Explore CTA

### 10.C Pagination

- [x] Load more (cursor API)

### 10.D Loading

- [x] Skeletons

### 10.E Quality gate (Phase 10 exit)

- [x] SRS §16.2; lint/types

---

## Phase 11 — Profile & follow lists

### 11.A Profile header

- [x] Cover bleed, avatar overlap, actions

### 11.B Profile sections

- [x] Posts default (no invented tabs)

### 11.C Followers / following

- [x] Row Follow button; empty; pagination

### 11.D Follow button states

- [x] Follow / Following UX

### 11.E Quality gate (Phase 11 exit)

- [x] SRS §17.2; lint/types

---

## Phase 12 — Engagement surfaces UX

### 12.A Post show

- [x] Focused thread + back

### 12.B Comments

- [x] One-level indent + composer

### 12.C Notification bell

- [x] SSR recent + Echo; primary unread

### 12.D Notifications index

- [x] Unread highlight + empty

### 12.E Bookmarks

- [x] Density + empty CTA

### 12.F Quality gate (Phase 12 exit)

- [x] SRS §18.2; lint/types (+ Pest if API)

---

## Phase 13 — Discovery UX

### 13.A Top-bar search

- [x] Entry → `/search`

### 13.B Search page

- [x] Tabs + result row types

### 13.C Explore

- [x] Modules + accurate copy (48h posts / 7d tags)

### 13.D Tag show

- [x] `#slug` header + list

### 13.E Right rail content

- [x] Trending tags wired

### 13.F Quality gate (Phase 13 exit)

- [x] SRS §19.2; lint/types

---

## Phase 14 — Messaging UX

### 14.A Inbox

- [x] Dense list + unread

### 14.B Thread split pane

- [x] Desktop list\|thread; mobile full

### 14.C Thread UX

- [x] Bubbles, receipts, typing

### 14.D Composer

- [x] Text + image; Enter sends

### 14.E Start conversation

- [x] Mutual-follow copy; profile Message

### 14.F Quality gate (Phase 14 exit)

- [x] SRS §20.2; lint/types

---

## Phase 15 — Guest, auth, settings, admin

### 15.A Welcome

- [x] Branded landing; remove Laravel stock

### 15.B Auth pages

- [x] Branded chrome + accent

### 15.C Settings

- [x] Denser forms; avatar/cover preview

### 15.D Admin

- [x] Tokens + confirm destructive

### 15.E Global QA

- [x] Cross-page light/dark/mobile

### 15.F Quality gate (Phase 15 exit)

- [x] SRS §21.2; UX roadmap complete

---

## Phase 16 — Motion foundation

### 16.A Spec

- [x] ADR 0007 + design 015 + SRS §22

### 16.B Library + wrappers

- [x] `motion` + MotionProvider / FadeIn / Stagger / usePrefersReducedMotion

### 16.C CSS tokens

- [x] Duration/ease + shimmer keyframes

### 16.D App root

- [x] Provider in `app.tsx`

### 16.E Skeletons

- [x] PostSkeleton shimmer

### 16.F Quality gate (Phase 16 exit)

- [x] SRS §22.3; lint/types

---

## Phase 17 — Motion interactions

### 17.A Like button

- [x] Scale pop + capped burst

### 17.B Bookmark

- [x] Spring fill

### 17.C Composer

- [x] Expand spring

### 17.D PostCard

- [x] Hover lift + enter stagger

### 17.E Nav

- [x] layoutId active indicator

### 17.F Confirm dialog

- [x] Spring scale + fade

### 17.G Comments / Follow

- [x] Reply expand; press feedback

### 17.H Quality gate (Phase 17 exit)

- [x] SRS §23.2; lint/types

---

## Phase 18 — Motion showcase

### 18.A Welcome

- [x] Parallax + staggered hero

### 18.B Auth

- [x] Card enter

### 18.C Profile header

- [x] Cover parallax; avatar scale-in

### 18.D Lists

- [x] Stagger + AnimatePresence load-more

### 18.E Messages

- [x] Bubble enter; typing pulse

### 18.F Page swap

- [x] Main column opacity/y

### 18.G Notification bell

- [x] Stagger dropdown

### 18.H Quality gate (Phase 18 exit)

- [x] SRS §24.3; motion roadmap complete

---

## Phase 19 — Messages UX depth

### 19.A Layout

- [x] Messages layout: hide right rail; main full width

### 19.B Auto-open

- [x] `GET /messages` → redirect to latest conversation; empty → inbox

### 19.C Shell

- [x] Split pane polish; inbox search; unread; start form in sidebar

### 19.D Scroll

- [x] Auto-scroll near-bottom; “New messages ↓” chip

### 19.E Composer

- [x] Autofocus; image preview; disable empty send; sticky footer

### 19.F Inbox live

- [x] Preview bump on Echo; avatar/snippet/time/unread

### 19.G Motion/a11y

- [x] Keep bubble/typing; reduced-motion; keyboard send

### 19.H Quality gate (Phase 19 exit)

- [x] Pest redirect; FE lint/types; SRS §26.3

---

## Phase 20 — Rich profile (About + Photos + privacy)

### 20.A Schema

- [x] About columns on `users` + `profile_privacy` JSON

### 20.B Privacy

- [x] Presenter filters `public` / `mutual` / `only_me`; no leak in props

### 20.C Settings

- [x] Edit About values + visibility selects

### 20.D Layout

- [x] Wider profile shell; tabs Posts / About / Photos

### 20.E Intro + Posts

- [x] 2-col: Intro + photos preview | Posts

### 20.F About page

- [x] `/u/{username}/about`

### 20.G Photos

- [x] `/u/{username}/photos` + preview on show

### 20.H Quality gate (Phase 20 exit)

- [x] Pest privacy/about/photos; Pint/PHPStan/lint/types; SRS §27.4

---

## Phase 21 — Notification badge effectiveness

### 21.A Provider

- [x] `UnreadBadgesProvider` seeds + resyncs from Inertia auth

### 21.B Live notif

- [x] Echo `.notification` bumps shared notifications count

### 21.C Live DM

- [x] `UnreadBadgesUpdated` to recipient after message create

### 21.D Mark-read

- [x] Bell item + notifications index link mark read then navigate

### 21.E Consumers

- [x] Bell, left rail, mobile nav use context

### 21.F Visual/a11y

- [x] `bg-destructive`, `9+`, accessible unread names

### 21.G Quality gate (Phase 21 exit)

- [x] Pest + lint/types; SRS §28.3

---

## Phase 22 — Emoji picker + large emoji stickers

### 22.A Lib

- [x] `emoji-picker-react` + `lib/emoji.ts` helpers

### 22.B Picker UI

- [x] Shared `EmojiPickerButton` (DropdownMenu)

### 22.C Composers

- [x] Wire into message / post / comment composers

### 22.D Stickers

- [x] Large render for emoji-only body (1–3 graphemes)

### 22.E Quality gate (Phase 22 exit)

- [x] Pest smoke + lint/types; SRS §29.3

---

## Phase 23 — Modern post create/edit (hybrid dialog)

### 23.A Shell

- [x] `PostComposerShell` Dialog shared by create + edit

### 23.B Media

- [x] Existing thumbs with X → `remove_media_ids[]`; add new (max 6)

### 23.C Create

- [x] Collapsed feed trigger opens create dialog

### 23.D Edit

- [x] PostCard Edit opens edit dialog (no inline form)

### 23.E Discard

- [x] Confirm when closing dirty dialog

### 23.F Quality gate (Phase 23 exit)

- [x] Pest create/update/media + lint/types; SRS §30.3

---

## Phase 24 — Post reactions (multi-expression)

### 24.A Schema

- [x] `likes.type` + `ReactionType` enum; backfill existing → `like`

### 24.B API

- [x] POST upsert `type`; DELETE remove; JSON `viewer_reaction` + `reaction_counts`

### 24.C Presenter

- [x] Post payload reaction fields on all timelines

### 24.D Notify

- [x] First-create only; typed message/payload

### 24.E UI

- [x] Reaction picker (hover/long-press) + button glyph/label/count

### 24.F Quality gate (Phase 24 exit)

- [x] Pest + lint/types; SRS §31.3

---

## Session log (newest first)

| Date | Phase | Change |
|------|-------|--------|
| 2026-08-09 | 29 | Inbox chrome polish: ConversationInbox (pill search + PenSquare compose); sheet/dialog New message; drop inline Start chat form. |
| 2026-08-09 | 29 | Phase 29 complete: mobile inbox-first, immersive thread, ConversationList + New sheet, visualViewport, emoji Sheet. Pest MessagingTest 9/9; types/lint green. |
| 2026-08-09 | 29 | Specced Phase 29 Messages mobile UX (ADR 0008 amend, design 027); Active → 29.A. |
| 2026-08-09 | 28 | Phase 28 complete: share to feed + copy link + DM embed; Pest 10/10; types/lint/phpstan green. |
| 2026-08-09 | 28 | Specced Phase 28 Facebook-like share (ADR 0013, design 026); Active → 28.A. |
| 2026-08-09 | — | Auto mark-all when opening notification bell or visiting `/notifications`. |
| 2026-08-09 | — | Notification post thumb on the right (`post_image` via presenter + like/comment/mention payloads). |
| 2026-08-09 | — | Facebook-style notifications: presenter hydrates actor avatar/body; shared NotificationItem on bell + index (New/Earlier). design 025. |
| 2026-08-09 | — | Feed/Explore: Inertia infinite scroll (`Inertia::scroll` + `<InfiniteScroll>`); drop Load more. |
| 2026-08-09 | — | PostCard denser spacing; Like/Comment/Bookmark compact as icon (count). |
| 2026-08-09 | 25–27 | Abandoned liquid glass; solid mobile top/dock+FAB; bottom-sheet composer; removed GlassSurface/tokens. types+lint. |
| 2026-08-09 | 25–27 | Glass polish pass: blur 40px + vibrancy, `.glass-sheet`/`.glass-scrim`, no nested glass, hide dock under composer, floating inset create sheet. |
| 2026-08-09 | 25–27 | Mobile liquid glass complete: tokens, GlassSurface, floating top/dock+FAB, create provider, dialog/composer glass, page-fit. types+lint green. |
| 2026-08-09 | 25 | Specced Phases 25–27 mobile liquid glass (ADR 0012, design 024); Active → 25.B. |
| 2026-08-09 | — | Safe post markdown (ADR 0011): SafePostMarkdown rule, react-markdown+sanitize, line-clamp See more. Pest 6/6. |
| 2026-08-09 | 24 | Phase 24 complete: 7 reactions, picker UX, likes.type, typed notify. Pest LikeToggle 4/4; types green. |
| 2026-08-09 | 24 | Specced Phase 24 post reactions (ADR 0010, design 023); Active → 24.A. |
| 2026-08-09 | — | PostCard counts on action buttons (Like/Comment/Save); drop separate summary row. |
| 2026-08-09 | — | PostCard engagement summary (icon + semibold counts); `bookmarks_count` in payload + bookmark JSON. |
| 2026-08-09 | — | PostCard quick Follow/Following; payload `user.can_follow` + `followed_by_viewer`. |
| 2026-08-09 | 23 | Phase 23 complete: PostComposerShell dialog, media X-remove, create/edit parity, discard-dirty. Pest+lint/types green. |
| 2026-08-09 | 23 | Specced Phase 23 post composer hybrid dialog (design 022); Active → 23.A. |
| 2026-08-09 | — | PLT Social branding: APP_NAME, favicon/logo/full-logo assets, AppLogo + auth/welcome/top-bar + OG meta. |
| 2026-08-09 | 22 | Phase 22 complete: emoji-picker-react, EmojiPickerButton on message/post/comment; large emoji-only stickers. Pest EmojiContent+Messaging green. |
| 2026-08-09 | 22 | Specced Phase 22 emoji picker + stickers (design 021); Active → 22.A. |
| 2026-08-09 | — | Post body clamp: See more / See less on feed cards; full body on post detail. |
| 2026-08-09 | — | Post media hybrid (Meta): 1 full-bleed contain, 2-up collage, 3+ square carousel + lightbox nav. |
| 2026-08-09 | — | PostCard UX polish: drop hover lift/shadow; overflow-hidden + break-words + header truncate. |
| 2026-08-09 | 21 | Message badge fix: full sync on network success; decrease-only for prefetch/history; pin count on messages/show + flushAll. |
| 2026-08-09 | 21 | Fix badge revive: lift UnreadBadgesProvider to app root; history restore cannot re-inflate unread; mark-read uses optimistic + onSuccess. |
| 2026-08-09 | 19 | Message thread: ResizeObserver re-pins to bottom when images load (open convo with media). |
| 2026-08-09 | 21 | Phase 21 complete: UnreadBadgesProvider, UnreadBadgesUpdated, mark-read on click, a11y. Pest notif+messaging green; lint/types clean. |
| 2026-08-09 | 20 | Settings UX polish: wider settings shell; avatar/cover via camera on profile header. |
| 2026-08-09 | 21 | Specced Phase 21 notification badges (design 020); Active → 21.A. |
| 2026-08-09 | 20 | Phase 20 complete: About fields + per-field privacy, Photos tab, wider 2-col profile. Pest Profile+Settings 10/10. |
| 2026-08-09 | 20 | Specced Phase 20 rich profile (ADR 0009, design 019); Active → 20.A. |
| 2026-08-09 | — | Hard lock document scroll: `fixed inset-0` shell + html/body overflow hidden on mount; Playwright confirmed bodyΔ=0, main scrolls. |
| 2026-08-09 | — | Viewport-locked chrome: `SocialChromeShell` + main `scroll-region`; rails/topbar non-sticky; profile parallax uses main container. |
| 2026-08-09 | 19 | Scroll fix: thread uses scrollTop (not scrollIntoView), viewport-locked messages shell, PageTransition opacity-only. |
| 2026-08-09 | 19 | Messages UX depth complete: full-width shell, auto-open latest, scroll chip, composer/inbox polish. Pest MessagingTest 7/7. |
| 2026-08-09 | 19 | Specced Phase 19 Messages UX (ADR 0008, design 018); Active → 19.A. |
| 2026-08-09 | 16–18 | Motion showcase complete: `motion` provider, micro-interactions, welcome/profile/lists/messages parallax & stagger. Pest 102/102. |
| 2026-08-09 | 16 | Specced motion Phases 16–18 (ADR/SRS/design/PROGRESS); Active → 16. |
| 2026-08-09 | 8–15 | UX redesign complete: social chrome, post unit, feed/profile/engagement/discovery/messages, welcome/auth/settings/admin. Pest 102/102. |
| 2026-08-09 | 8–13 | Facebook-like density: feed/bookmarks/explore/search/tags/post/notifications/profile + composer/media; Phase 8 `[x]`; Active → 9.F. |
| 2026-08-09 | 8 | Spec'd UX Phases 8–15 (SRS/ADR/design/PROGRESS/prompts); Active phase → 8. |
| 2026-08-09 | 7 | Phase 7 complete: FULLTEXT (MySQL) + LIKE fallback, MEDIA_DISK/MediaDisk, Horizon admin gate. Pest 102/102. |
| 2026-08-09 | 7 | Started Phase 7 ops (FULLTEXT + media disk + Horizon). |
| 2026-08-09 | 6 | Phase 6 complete: tags/post_tag + HashtagService, `/t/{slug}`, explore trending_tags, search tab=tags, rich-text # linkify. Pest 98/98. |
| 2026-08-09 | 6 | Started Phase 6 hashtags & topic discovery. |
| 2026-08-09 | 5 | Phase 5 complete: bookmarks JSON toggle + Saved page, @mentions sync/notify/linkify, post search tab. Pest 90/90. |
| 2026-08-09 | 5 | Started Phase 5 engagement depth (bookmarks, mentions, post search). |
| 2026-08-08 | 4 | Phase 4 complete: rate limits, admin audit, failed-jobs UI, ops runbook, admin dashboard, unread DM badge, remove-media edit. Pest 80/80. |
| 2026-08-08 | 4 | Started Phase 4 hardening (spec + implementation). |
| 2026-08-08 | 3 | Phase 3 complete: post_media+GD job, mutual DM+Reverb, search/explore 48h score, Redis feed cache+indexes, design 002. Pest 72/72. Roadmap done. |
| 2026-08-08 | 2 | Phase 2 complete: likes JSON toggle, one-level comments + post show, notifications (DB+broadcast), Reverb/Echo, bell. Pest 62/62. Active phase → 3. |
| 2026-08-08 | 1 | Implemented Phase 1 MVP end-to-end (schema, feed, profile, follows, admin, Pest 54/54, PHPStan/tsc/eslint green). Advanced Active phase → 2. |
| 2026-08-08 | — | Added `docs/architecture/module-map.md` — phased folder/file blueprint for P1–P3 (docs only). |
| 2026-08-08 | — | Added vibe-coding docs layout (`architecture`, `decisions`, `design`, `notes`, `handoffs`, `prompts`) + root `AGENTS.md`. |
| 2026-08-08 | — | Created `docs/PROGRESS.md` and agent progress rules. |
