# Slice 0 — Actor from the JWT

**Jira:** [KAN-8](https://paulodevmais.atlassian.net/browse/KAN-8) · **Design doc:** [§7 Session (Actor)](../../design-docs/employee-lifecycle-v1.md#7-session-actor) · **Index:** [`README.md`](README.md)

## Objective

Give the app an **Actor**. `useAuthStore` persists only `token` today, so the Actor's Role — the switch that decides which lifecycle actions are visible — is never read. After this slice, any module can ask the store for `actor.role` and get `EMPLOYEE`, `MANAGER`, `ADMIN`, or nothing.

Nothing visible changes for the operator in this slice. It unblocks slice 2.

## Files

| File | Change |
|------|--------|
| `src/domain/decode-jwt.ts` | **new** — base64url payload decode, no signature verification |
| `src/types/actor.ts` | **new** — `ActorRole`, `Actor` |
| `src/stores/auth.ts` | Actor derived from the token; `logout` clears the session |
| `AGENTS.md` | folder map records `src/domain/` (pure helpers) |

## Contracts

```ts
// src/types/actor.ts
export type ActorRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN'

export interface Actor {
  id: string
  role: ActorRole | null
  status: string | null
}
```

```ts
// src/domain/decode-jwt.ts
/** Reads the payload of a JWT. Does not verify the signature — the API does that. */
export function decodeJwtPayload(token: string): Record<string, unknown> | null
```

```ts
// src/stores/auth.ts
const token: Ref<string | null>
const actor: ComputedRef<Actor | null>   // derived from token, never persisted on its own
function setSession(result: Account.LoginResponse): void
function logout(): void
```

## Requirements

1. The JWT payload from `POST /auth` carries `id`, `name`, `email`, `role`, `status`. Read `id`, `role`, `status`. Ignore the rest.
2. Decode base64url (`-` → `+`, `_` → `/`, pad to a multiple of 4) and `JSON.parse`. Any failure — not three segments, bad base64, bad JSON — returns `null`.
3. `actor` is a `computed` over `token`. Persistence stays `pick: ['token']`, so a page reload rehydrates the token and the Actor is re-derived from it. Do not persist a separate `actor` key.
4. `role` is only set when the payload value is exactly `EMPLOYEE`, `MANAGER` or `ADMIN`. Anything else — missing, misspelled, an array — becomes `null`. **Never default to `ADMIN`.**
5. `actor` is `null` when there is no token or the token cannot be decoded.
6. `logout()` sets `token` to `null`, which drops the Actor with it.
7. The signature is not verified and `exp` is not checked. The API answers a stale token with `401`.
8. Never store the Actor's password anywhere, including the Remove step-up added in slice 5.
9. The router guard stays “has token”. An Actor whose `status !== ACTIVE` keeps their token until Auth re-checks; no extra client lockout in this version.

## Out of scope

- `GET /me` — Role comes from the JWT this version.
- A permission catalog or ACL. Role is the only visibility switch.
- Showing the Actor's real name/role in the app header (`AppContainer.vue` still hardcodes “Grau usuário”).
- Refreshing or revoking tokens.

## Acceptance criteria

- [ ] After login with a valid token, `useAuthStore().actor` exposes the `id`, `role` and `status` from the payload.
- [ ] After a full page reload, the Actor is still available without a new login.
- [ ] A malformed or truncated token leaves `actor` as `null` and throws nothing — the app still renders.
- [ ] A payload without `role`, or with an unknown role, yields `actor.role === null` and never `ADMIN`.
- [ ] `logout()` leaves `token` and `actor` at `null` and clears the persisted key.
- [ ] `localStorage` contains the token only — no `actor` key, no password.
- [ ] `AGENTS.md` folder map lists `src/domain/`.

## Dependencies

None. This is the first slice.
