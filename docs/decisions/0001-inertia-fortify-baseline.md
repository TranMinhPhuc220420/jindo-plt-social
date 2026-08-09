# ADR 0001: Keep Inertia + Fortify baseline

- Status: Accepted
- Date: 2026-08-08

## Context

PLT Social is built on the Laravel React starter kit. An older SRS draft assumed Breeze/Jetstream and a looser React/API split, which does not match the repo.

## Decision

- Use **Inertia.js + React** for app UI (server-driven pages).
- Keep **Laravel Fortify** (+ existing passkeys / 2FA) for authentication.
- Prefer Wayfinder-typed routes/actions over hard-coded URLs.
- Do not introduce Breeze, Jetstream, or a separate SPA REST API unless a new ADR supersedes this.

## Consequences

- Controllers return `Inertia::render` / redirects; JSON endpoints only when justified (e.g. lightweight toggles).
- Social features extend existing shell, settings, and auth flows.
- Agents must read [`../SRS.md`](../SRS.md) §0 baseline before scaffolding auth again.

## Alternatives considered

- Full SPA + Sanctum API — higher split cost; rejected for MVP.
- Replace Fortify with Breeze/Jetstream — would discard working passkeys/2FA/settings; rejected.
