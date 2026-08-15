# Design: PLT Học Bá rebrand

- Phase: 33
- Status: Implemented
- Related: ADR 0017, SRS Phase 33, PROGRESS 33.A–33.D

## Goal

Show **PLT Học Bá** as a closed learning community on guest and compose surfaces. Do not redesign chrome or replace logos.

## UX / pages

### Welcome

- Hero: app name from `config('app.name')`
- Line 1: tagline (`Học để giỏi - Chia sẻ để cùng tiến bộ`)
- Line 2: subtitle (`Nền tảng cộng đồng học tập của PLT Solutions`)
- Body: members are provisioned by PLT (learners / students / interns). No public signup.
- Primary CTA: Log in (Sign up only if `canRegister`)

### Auth

- Logo `alt` uses shared `name`
- Closed register: administrator creates accounts for approved members

### Composer

- Placeholder: share a note, question, or what you learned — not “What’s on your mind”
- (Phase 34 adds guidelines notice)

### Meta

- Blade OG/Twitter description matches the learning-community line, not “follow friends”

## Data & APIs

- `config('app.name')`, `config('app.tagline')`, `config('app.subtitle')`
- Shared Inertia props: `name`, `tagline`, `subtitle`

## Open questions

None for this pass. New logo art waits on the operator.
