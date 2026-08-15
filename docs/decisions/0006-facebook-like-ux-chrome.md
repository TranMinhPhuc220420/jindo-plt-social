# ADR 0006: Facebook-like UX chrome & redesign phases

- Status: Accepted
- Date: 2026-08-09

## Context

Phases 1–7 shipped full social product behavior on the Laravel React starter kit. The authenticated shell is still an **inset shadcn sidebar** (“Platform” label, breadcrumbs, admin density). Empty states are text-only; welcome remains stock Laravel. Users chose a **docs-first** UX redesign with a **Facebook-like** visual direction (feed-centric, denser, familiar patterns — not pixel-perfect Meta cloning).

## Decision

1. **Phases 8–15** are a dedicated UX/UI roadmap (no new product domains such as Groups/Stories/Ads). Spec lives in SRS; status in PROGRESS; per-phase design notes under `docs/design/007`–`014`.
2. **Primary chrome** replaces inset-sidebar-as-default with a **social shell**:
   - Desktop: sticky top bar (logo, search entry, create, notification bell, avatar menu) + left rail (icon+label nav) + center column (~680px) + optional right rail.
   - Mobile: compact top bar + content; left rail collapses to bottom nav or hamburger (documented in Phase 8 design).
3. **Tokens**: introduce a social blue primary accent (FB-like, not Meta trademark assets), denser spacing scale, divider/surface tokens; keep light/dark appearance; keep shadcn/Radix primitives underneath.
4. **Implementation order**: Foundation (8) → Post unit (9) → Feed (10) → Profile (11) → Engagement (12) → Discovery (13) → Messages (14) → Guest/auth/settings/admin (15). Do not skip quality gates.
5. **Backend**: prefer presentation-only changes. Allowed API tweaks when UX requires them (e.g. SSR recent notifications for the bell) — call out in the phase design note.

## Consequences

- Agents must follow Active phase in PROGRESS; Phase 8 must land before visual work on feed/profile/etc.
- `AppSidebarLayout` is no longer the social chrome. **Admin** (`/admin/*`) uses a dedicated inset sidebar console (`AdminLayout`); settings stay on the social shell.
- §7.4 NFR updates: empty states with CTA, social density, hide admin-style breadcrumbs on social surfaces.

## Alternatives considered

- Polish-only on existing sidebar — rejected; user chose Facebook-like chrome.
- Pixel Meta clone / Meta brand assets — rejected (legal + brand identity for PLT Social).
- Modern-minimal (non-FB) social — rejected; user chose 2A Facebook-like.
- Implement UI without docs — rejected; user chose docs-first (1B).
