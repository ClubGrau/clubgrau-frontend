# Implementation specs: Employee Lifecycle (frontend v1)

**Status:** Ready to implement
**Date:** 24/08/2026
**PRD:** [`docs/prd/employee-lifecycle-v1.md`](../../prd/employee-lifecycle-v1.md)
**Design doc:** [`docs/design-docs/employee-lifecycle-v1.md`](../../design-docs/employee-lifecycle-v1.md) — these specs expand §14
**Glossary:** [`CONTEXT.md`](../../../CONTEXT.md) · **Constitution:** [`AGENTS.md`](../../../AGENTS.md)

One file per slice of design doc §14. A spec says **which files change**, **which contracts they expose**, and **what an operator must observe**. It does not restate product rules — those stay in the PRD — and it does not re-decide shape — that stays in the design doc.

## Slices

| Slice | Jira | Spec | Ships |
|-------|------|------|-------|
| 0 | [KAN-8](https://paulodevmais.atlassian.net/browse/KAN-8) | [`slice-0-actor-from-jwt.md`](slice-0-actor-from-jwt.md) | JWT → auth store Actor (`id`, `role`, `status`) |
| 1 | [KAN-9](https://paulodevmais.atlassian.net/browse/KAN-9) | [`slice-1-http-lifecycle-commands.md`](slice-1-http-lifecycle-commands.md) | `updateStatus` + `remove` on the employees port, plus the error taxonomy |
| 2 | [KAN-10](https://paulodevmais.atlassian.net/browse/KAN-10) | [`slice-2-visibility-helper.md`](slice-2-visibility-helper.md) | Pure helper + menu/detail wiring; kills the “clique aqui” shortcut |
| 3 | [KAN-11](https://paulodevmais.atlassian.net/browse/KAN-11) | [`slice-3-deactivate.md`](slice-3-deactivate.md) | Deactivate confirm + mutation + close drawer |
| 4 | [KAN-12](https://paulodevmais.atlassian.net/browse/KAN-12) | [`slice-4-reactivate.md`](slice-4-reactivate.md) | Reactivate in one click + stay on detail |
| 5 | [KAN-13](https://paulodevmais.atlassian.net/browse/KAN-13) | [`slice-5-remove.md`](slice-5-remove.md) | Remove step-up modal + mutation + close/toast + `401` / `409` |
| 6 | a definir | [`slice-6-self-deactivate-logout.md`](slice-6-self-deactivate-logout.md) | Self-Deactivate: drop client session + silent redirect to `/login` |

Slices 0–5 are on **Grau System Board / Prioritized**. Slice 6 Jira is pending. The API side shipped under [KAN-1](https://paulodevmais.atlassian.net/browse/KAN-1) … [KAN-7](https://paulodevmais.atlassian.net/browse/KAN-7).

Order is sequential: 0 → 1 → 2 → 3 → 4 → 5. Slices 3 and 4 are independent of each other once 2 is in. Slice 6 depends on 3.

## Shared conventions

- **Never send `actorId`.** The API stamps the Actor from the Bearer token.
- **Never send `status: "REMOVED"` or `status: "VACATION"`** on `update-status` in this feature.
- **Hiding a control is not authorization.** Every mutation still handles `400` / `401` / `403` / `409`.
- **Views do not call Axios.** View → composable → port, per [`AGENTS.md`](../../../AGENTS.md).
- **Labels in Portuguese, code in English.** Inativar / Reativar / Remover map to Deactivate / Reactivate / Remove.
- Mutations use `retry: 0` and invalidate `['employees']` on success.

## Decisions taken while writing these specs

These are shape calls the design doc left open. They are binding for the slices below.

1. **New folder `src/domain/` for pure, framework-free modules.** `decode-jwt.ts`, `employee-lifecycle.ts` and `lifecycle-error.ts` are plain TypeScript with no Vue, no Axios, no Pinia. They do not fit `composables/` (orchestration), `services/api/` (HTTP), or `constants/` (UI maps). Slice 0 also amends the [`AGENTS.md`](../../../AGENTS.md) folder map to record the new folder.
2. **Actor is derived, not persisted.** The auth store persists `token` only; `actor` is a `computed` over the token. Reload rehydrates the token and the Actor falls out of it, so a persisted Actor can never drift from the token that is actually being sent.
3. **Toast infrastructure ships in slice 3.** The repo has no toast today and design doc §9.4 requires one for every lifecycle outcome. Slice 3 adds a minimal `useToast` + `ToastHost`; slices 4 and 5 consume it.
4. **`InactivateModal.vue` keeps its filename.** It loses the `mode` prop and the Remove link instead of being renamed, so the [`AGENTS.md`](../../../AGENTS.md) reference stays valid. Remove gets its own component.

## Known gaps (not blocking)

- There is no test runner in `package.json`. Acceptance criteria are written as observable operator behaviour and are verified manually. Adding Vitest for `src/domain/` is a good follow-up but is not part of this feature.
- Token expiry (`exp`) is not checked on the client. A stale token is answered by the API with `401`.
