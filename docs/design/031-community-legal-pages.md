# Design: Community legal pages

- Phase: 34
- Status: Implemented
- Related: ADR 0017, SRS Phase 34, PROGRESS 34.A–34.D

## Goal

Publish Vietnamese **Nội quy**, **Bảo vệ dữ liệu**, and **Bản quyền** pages that guests can read. Copy is a draft for counsel.

## UX / pages

| Path | Source |
|------|--------|
| `/guidelines` | `resources/legal/guidelines.md` |
| `/privacy` | `resources/legal/privacy.md` |
| `/copyright` | `resources/legal/copyright.md` |

Shared article layout: logo, title, rendered markdown, links among the three pages. Footer links on welcome, auth, settings, and the post composer.

Composer notice: posting accepts the guidelines and forbids sharing copyrighted textbooks/software.

Do not describe the product as a public social network.

## Data & APIs

- `GET` legal routes are public
- `LegalController` reads markdown, `Str::markdown()`, Inertia `legal/show`

## Open questions

Counsel must review before production.
