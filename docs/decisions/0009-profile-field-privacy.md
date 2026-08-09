# ADR 0009: Profile field privacy

- Status: Accepted
- Date: 2026-08-09

## Context

Phase 20 adds Facebook-like About/Intro fields. Users want to hide sensitive fields (e.g. birthday, gender) from strangers while still sharing workplace/location publicly. The product already uses **mutual follow** as the “friends” gate for DMs.

## Decision

1. **Visibility enum** per About field: `public` | `mutual` | `only_me`.
2. **`mutual`** = viewer and profile owner are mutual followers (`User::isMutualWith`).
3. **Filter at present time** in a presenter: Inertia props for non-owners must omit values the viewer cannot see. Never send hidden raw values and hide them only in the UI.
4. Store map in `users.profile_privacy` JSON (`field_key` → visibility). Missing keys use defaults (`only_me` for `birthday`/`gender`; `public` otherwise).
5. **Photos tab** is not separately gated — same audience as post lists (authenticated).

## Consequences

- Owner always sees all fields + privacy settings (settings + own profile).
- Strangers see only `public` fields; mutual followers also see `mutual` fields.
- Policies remain on profile follow/message; About visibility is presentation filtering.

## Alternatives considered

- Whole-profile private accounts — deferred (non-goal).
- Separate visibility column per field — rejected; JSON map is enough for presentation.
- Client-only hide — rejected; leaks data in page props.
