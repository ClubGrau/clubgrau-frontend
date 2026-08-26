# Slice 6 — Self-Deactivate: drop the client session and redirect to login

**Jira:** a definir · **Design doc:** [§9.2](../../design-docs/employee-lifecycle-v1.md#92-deactivate-confirm), [§9.5](../../design-docs/employee-lifecycle-v1.md#95-self-deactivate-client-session), [§12](../../design-docs/employee-lifecycle-v1.md#12-wiring-composables), [§13](../../design-docs/employee-lifecycle-v1.md#13-sequences) · **PRD:** [Rule 2.9](../../prd/employee-lifecycle-v1.md) · **Index:** [`README.md`](README.md)

## Objective

When an ADMIN inactivates **their own** account and the API returns `200`, the frontend drops the client session and sends them to `/login`. The redirect is silent — no toast. Last Admin on themselves remains `409`: the operator stays logged in on the confirm modal.

Server-side JWT revocation stays out of scope (Auth sibling). This slice is the client-side compensation: the operator just became `INACTIVE` and would not be able to log in again.

## Files

| File | Change |
|------|--------|
| `src/composables/useEmployeeLifecycle.ts` | `getActorId` + `onSelfDeactivated`; on `200` if Target === Actor, skip the generic toast and call `onSelfDeactivated` |
| `src/views/Employees/Employees.vue` | wire `getActorId`, `logout` + `router.push('/login')`; pass `isSelf` to the modal |
| `src/components/Modal/InactivateModal.vue` | distinct title/body when `isSelf` |
| `src/composables/useEmployeeLifecycle.test.ts` | self vs non-self success branch |

## Contracts

```ts
// src/composables/useEmployeeLifecycle.ts
export function useEmployeeLifecycle(api: EmployeesApi, options: {
  getActorId: () => string | null
  onStatusChanged: (result: UpdateEmployeeStatusResult) => void
  onSelfDeactivated: (result: UpdateEmployeeStatusResult) => void
}) {
  deactivate(id: string): void
  isDeactivating: Ref<boolean>
}

// src/components/Modal/InactivateModal.vue
props: employeeId: string, isSelf?: boolean
```

## Requirements

1. Inject Actor identity as `getActorId: () => string | null` so the composable stays testable. The view passes `() => authStore.actor?.id ?? null`.
2. On `200`, always `invalidateQueries({ queryKey: ['employees'] })`.
3. If `result.id === getActorId()`: do **not** push the generic success toast; call `onSelfDeactivated(result)`. Do not call `onStatusChanged`.
4. Otherwise: keep slice 3 behaviour (generic toast + `onStatusChanged` → `closeDrawer()`).
5. The view implements `onSelfDeactivated` as `authStore.logout()` then `router.push('/login')`. `logout()` already clears `token` and `localStorage` `auth`.
6. Redirect is **silent**. No toast, no flash of the generic “você pode reativá-lo pelo perfil” copy.
7. Modal copy when `isSelf`: warn that the operator is inactivating their own account, they will be disconnected, and they cannot Reactivate themselves. Primary stays **Inativar**.
8. `onError` is unchanged. Last Admin `409` still shows the Last Admin copy and keeps the session. No logout on error.

## Out of scope

- Server-side JWT revocation (Auth sibling).
- Self-Remove (already impossible: Actor `ACTIVE` + Target `INACTIVE`).
- Changing `canDeactivate` to hide self. Self-Deactivate remains visible for a non-Last-Admin ADMIN; `409` handles Last Admin.

## Acceptance criteria

- [ ] ADMIN inactivates their own account → `200` → no toast → token cleared → `/login`. Reloading stays logged out (`localStorage` `auth` gone).
- [ ] ADMIN inactivates another collaborator → generic toast + `closeDrawer()` (slice 3 unchanged).
- [ ] Last Admin inactivates themselves → `409` → Last Admin copy → modal stays open → session kept.
- [ ] Confirm modal shows distinct copy when Target === Actor.

## Dependencies

Slice 3.
