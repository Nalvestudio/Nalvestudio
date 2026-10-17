# Feature: account-auth

## Objective
Standard, simple email + password accounts for the store: register, login, logout and current-session lookup, wired into the existing `/cuenta` screen.

## Problem / Why
`/cuenta` (`apps/web/src/components/account/AccountScreen.tsx`) is fully marked up but every form is a stub. The `User` model exists but there is no auth.

## Scope
- Password hashing with `node:crypto` scrypt, compatible with the legacy `s1$salt$hash` format (`../sticker-shop/extras.js`) so migrated users can log in.
- DB-backed sessions: `Session` model + Prisma migration, opaque random token in an httpOnly cookie (store only a SHA-256 of the token).
- API routes: `POST /api/account/register`, `POST /api/account/login`, `POST /api/account/logout`, `GET /api/account/me`.
- Basic validation: name required, valid email (normalized lowercase/trim), password min 8 chars; generic login error message.
- Wire register/login/logout in `AccountScreen` to the API; logged-in view shows the user.

## Out of scope
Password reset, email verification, profile edit, password change, account deletion, orders list, OAuth, rate limiting.

## Constraints
- No new auth libraries. Follow `apps/web/src/lib/http.ts` helpers and existing route style.
- TypeScript strict; typecheck must pass.

## Delivery
- Strategy: `exception-ok` (local repo without remote). Work-unit commits on `feat/account-auth`.
- Forecast: ~350 authored lines.

## Tasks
- [x] T1 Auth core: `Session` model + migration, `lib/auth` (scrypt hash/verify legacy-compatible, session create/read/destroy, cookie), validation, unit test for hash/verify. Route: delegated (writer trigger: 2+ non-trivial files). Commit `1a0d770`.
- [x] T2 API routes register/login/logout/me. Route: delegated (same writer). Commit `a2ea519`.
- [x] T3 Wire `AccountScreen` register/login/logout + logged-in state. Route: delegated (same writer). Commit `75685ef`.

## Acceptance criteria
- Register creates user (hashed), sets session cookie, duplicate email → 409.
- Login with correct password sets cookie; wrong → 401 generic message. Legacy `s1$` hashes verify.
- `me` returns user without `passwordHash`; logout deletes session and clears cookie.

## Checks
- Unit test for password hash/verify (RED→GREEN).
- `typecheck` for `apps/web`.

## Progress
- Branch `feat/account-auth` created from `feat/legacy-design-port`.
- T1 (`1a0d770`): `Session` model (`sessions`, MySQL) + migration `20261017024144_add_sessions` via `prisma migrate dev` on local docker DB; `lib/auth/password.ts` (scrypt defaults, 16B salt, 64B key, `s1$salt$hash`, timingSafeEqual); `lib/auth/session.ts` (32B random token, SHA-256 stored, cookie `nalv_session` httpOnly/lax/secure-in-prod, 30 days); `lib/validation.ts`; tests in `apps/web/test`; `test` script.
- T2 (`a2ea519`): register 201/400/409, login generic 401 (dummy-hash verify for unknown emails), logout, me (401 `{user:null}` without session).
- T3 (`75685ef`): `AccountScreen` loads `/api/account/me` on mount; login/register/logout wired; reset/profile/password/delete still stubbed; markup unchanged.

## Verification evidence
- `bun run --cwd apps/web test` before `password.ts` existed: RED (`Cannot find module '../src/lib/auth/password'`).
- `bun run --cwd apps/web test`: GREEN, 7 pass / 0 fail (incl. a hash produced with the legacy `hashPw` algorithm).
- `bun run --cwd apps/web typecheck`: pass (one transient failure from stale `.next/types` while the running dev server regenerated route types; passed on rerun).
- curl smoke on running dev server: register 201 (email normalized), duplicate 409, me 200 without `passwordHash`, wrong password 401, unknown email 401 (same message), login 200 + HttpOnly cookie, logout 200, me after logout 401. Smoke user deleted. `/cuenta` 200.

## Notes
- Init migration `20261017023026_init` and `migration_lock.toml` remain untracked; the committed `add_sessions` migration depends on them.

## Next step
Decide on committing the init migration; manual browser check of `/cuenta`.
