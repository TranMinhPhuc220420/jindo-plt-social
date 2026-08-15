# Design: Minimal About + under-18 provisioning

- Phase: 36
- Status: Implemented
- Related: ADR 0018, SRS Phase 36, PROGRESS 36.A–36.E

## Goal

Stop collecting social About fields. Require date of birth when an admin creates a member. Apply guardian consent for children under 16.

## UX / pages

### Settings / About

- Identity: name, username, email, bio
- About: **education** only (optional, with visibility)
- Birthday, gender, hometown, workplace, website, location, relationship: hidden (columns kept)

### Admin create user

- Required: name, username, email, password, birthday
- If age 16–17: checkbox `under18_attested`
- If age &lt; 16: guardian name, email, relationship; checkbox `guardian_consented`; if age ≥ 7 also `child_consented`
- Child (&lt; 16) public About is empty for non-owners

## Data & APIs

- Reuse `users.birthday`
- New nullable: `guardian_name`, `guardian_email`, `guardian_relationship`, `guardian_consented_at`, `child_consented_at`, `under18_attested_at`
- `User::isChild()`, `User::isUnder18()`
- `StoreUserRequest` age-conditional rules
- `CreateNewUser::provision` persists guardian fields

## Open questions

None for this pass. No parent login portal.
