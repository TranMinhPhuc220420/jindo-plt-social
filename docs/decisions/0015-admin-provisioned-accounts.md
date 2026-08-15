# ADR 0015: Admin-provisioned accounts (invite-only)

- Status: Accepted
- Date: 2026-08-15

## Context

Public Fortify self-registration is not appropriate while the product is invite-only. Guests must not create accounts. Administrators still need a way to provision members with a temporary password (no mail required).

## Decision

1. Keep Fortify `Features::registration()` so Wayfinder `/register` routes stay generated.
2. Gate public signup with `config('fortify.public_registration')` / `FORTIFY_PUBLIC_REGISTRATION` (default **false**).
3. When off: GET `/register` shows a closed page; POST `/register` returns 403; Welcome/Login hide Sign up CTAs (`canRegister`).
4. Admins create users at `/admin/users` (name, username, email, password). Role is always `user`. Email is marked verified so the member can sign in immediately. Audit `user.created` (no password in meta).
5. Re-enable self-signup by setting `FORTIFY_PUBLIC_REGISTRATION=true` (no route deletion).

## Consequences

- Pros: Invite-only without ripping Fortify; reversible; admin stays logged in after create.
- Cons: Admin must share the temporary password out of band; closed register URL still exists as GET.
- Follow-ups: Optional invite email / password-reset onboarding when mail is reliable.

## Alternatives considered

- Remove `Features::registration()` — breaks Wayfinder/`@/routes/register` TypeScript until restored.
- Password-reset email instead of admin-set password — needs working mail; rejected for this pass.
