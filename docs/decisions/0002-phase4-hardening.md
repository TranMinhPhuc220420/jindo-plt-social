# ADR 0002: Phase 4 prioritizes hardening over new domains

- Status: Accepted
- Date: 2026-08-08

## Context

Phases 1–3 delivered the social MVP (graph, engagement, media, DM, search/explore). SRS §7 still had open gaps (rate limits, admin audit, observability). Product pressure could push bookmarks/mentions next, but production readiness was weaker than feature breadth.

## Decision

- **Phase 4** focuses on hardening and product readiness: rate limits, admin audit logs, ops docs (Redis/S3/workers), failed-job visibility, minimal admin analytics, and in-scope UX polish (unread DMs, remove media on edit).
- Do **not** add new social domains in Phase 4 (bookmarks, @mentions, groups, stories) unless a later ADR + SRS section explicitly expands scope.

## Consequences

- Agents must treat Phase 4 items in `PROGRESS.md` as the active phase.
- Engagement-depth features wait until Phase 4 overview is `[x]` (or an explicit user override).

## Alternatives considered

- Jump to bookmarks/search-in-posts — deferred; increases attack surface before rate limits/audit land.
- Full Horizon + APM stack — optional later; Phase 4 ships failed-jobs UI + runbook instead.
