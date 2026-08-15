# ADR 0018: Minimal profile data and child-account provisioning

- Status: Accepted
- Date: 2026-08-15

## Context

The Facebook-like About card collected workplace, hometown, gender, relationship, website, location, and birthday as social identity. The learning-community brief asks to collect only what is needed (name, email, account) and to handle members under 18 carefully under Luật 91/2025/QH15.

Age is still required at provisioning so the operator can apply child-data rules. Vietnamese child-protection law treats **trẻ em** as under 16; the operator also asked for extra care under 18.

## Decision

1. Keep existing columns; do **not** drop them. Stop collecting and showing social About fields except **education**.
2. Collect **date of birth** on admin provision using `users.birthday`. Do not render birthday on public About. Members do not edit birthday in settings.
3. Age bands at provision:
   - 18+: birthday only
   - 16–17: birthday + admin attestation that a parent/school is aware
   - under 16: guardian name, email, relationship + guardian consent timestamp; if 7–15 also child-consent timestamp
4. Accessors: `isChild()` age &lt; 16, `isUnder18()` age &lt; 18. Child profiles show no About to non-owners.
5. Existing users with null birthday keep access; admins backfill later.
6. Legal copy is a draft. This ADR is product scaffolding, not a legal opinion.

## Consequences

- Pros: Matches the minimization brief without a destructive migration; birthday has one column.
- Cons: Stale social fields may remain in the database; age is inferred from birthday.
- Follow-ups: Counsel review of `/privacy`; optional parental portal later.

## Alternatives considered

- Drop unused columns now — rejected; data loss for existing rows.
- Ban all under-18 accounts — rejected; the community is for classes that may include minors.
- Collect age as an integer instead of birthday — rejected; birthday already exists and is more precise.
