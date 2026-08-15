# ADR 0017: PLT Học Bá is a closed learning community

- Status: Accepted
- Date: 2026-08-15

## Context

The product was specified and branded as **PLT Social**, a Facebook-like social network. The operator (PLT Solutions) wants a **closed learning community** for learners, students, and interns they provision — not a public social network. Calling it a public social network would misstate the model and can change legal duties if the audience is later opened to the public.

Invite-only accounts (ADR 0015) and pre-publish moderation (ADR 0016) already match a controlled community. Branding and copy did not.

## Decision

1. Display name is **PLT Học Bá** (`APP_NAME`). Subtitle: **Nền tảng cộng đồng học tập của PLT Solutions**. Tagline: **Học để giỏi - Chia sẻ để cùng tiến bộ**.
2. Guest, OG, auth, and composer copy describe a **learning community with admin-provisioned members**. Do not market “public social network”, open signup, or “connect with friends”.
3. Keep internal identifiers (`jindo_plt_social`, `social-*` components, repo folder). Renaming those is out of scope.
4. Public self-registration stays off by default (ADR 0015). Do not re-enable it as part of the rebrand.
5. Legal pages, content reports, and data-minimization / child-data flows are follow-up phases (34–36), not this ADR’s implementation.

## Consequences

- Pros: Product language matches the intended use; existing chrome and stack stay.
- Cons: Historical phase names still say “social”; mixed English chrome + Vietnamese brand copy until a later i18n pass.
- `REDIS_PREFIX` and `HORIZON_PREFIX` must stay pinned (not derived from `APP_NAME`). Laravel’s default prefixes follow the app name, so a rebrand while Horizon is running leaves `ProcessPostMediaJob` on a new Redis key that workers never pop — post images stay on “Processing…”.
- Follow-ups: Phases 34–36 (guidelines/privacy/copyright, reports, PII + under-18). Legal copy is a draft for counsel review.

## Alternatives considered

- Rebuild as an LMS — rejected; the feed/community model is what members need.
- Rename every `social-*` file and the database — rejected; high churn, no user-facing gain.
- Open public registration under the new name — rejected; that is a public social network.
