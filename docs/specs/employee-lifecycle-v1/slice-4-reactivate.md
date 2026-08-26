# Slice 4 — Reactivate: one click, stay on the detail

**Jira:** [KAN-12](https://paulodevmais.atlassian.net/browse/KAN-12) · **Design doc:** [§9.1](../../design-docs/employee-lifecycle-v1.md#91-row-menu-and-detail-header), [§13](../../design-docs/employee-lifecycle-v1.md#13-sequences) · **Index:** [`README.md`](README.md)

## Objective

Close the INACTIVE fork's non-destructive half. Reativar restores the same identity on the same `employeeId`; it is not irreversible, so it needs no confirm modal and no password. One click from the row menu or the profile, and the operator stays on that profile now showing `ACTIVE`.

## Files

| File | Change |
|------|--------|
| `src/composables/useEmployeeLifecycle.ts` | adds `reactivate` on the same mutation |
| `src/views/Employees/Employees.vue` | menu and detail actions call it directly |

## Contracts

```ts
// src/composables/useEmployeeLifecycle.ts — added
reactivate(id: string): void
isReactivating: Ref<boolean>
```

## Requirements

1. Body is `{ id, status: 'ACTIVE' }`. No `actorId`. Same port method as Deactivate.
2. **No modal and no password.** Reactivate is an operational restore, not a destructive action; destructive confirmation stays on Inativar and Remover only.
3. On `200`, patch the snapshot status from the response and stay on the same detail, now `ACTIVE`. Do not switch the list tab, do not close the drawer (unlike Deactivate, which closes everything).
4. Triggering from the row menu with no drawer open opens the detail on that Target after success.
5. Invalidate `['employees']` on success. `retry: 0`.
6. Toasts:
   - `200` → “Colaborador reativado (mesma identidade).”
   - `403` → “Ação não permitida.”
   - `400` / `409` / `UNKNOWN` → show the `error` string from the API. A `409` here typically means the Target is already `ACTIVE`.
7. The action is disabled while in flight.
8. The button only renders when `canReactivate` is true — it is never offered on `ACTIVE` or `VACATION`.

## Out of scope

- A confirm dialog for Reactivate. Explicitly rejected in design doc §9.1.
- Re-sending a welcome email, resetting a password, or any Auth side effect.
- Bulk reactivate.

## Acceptance criteria

- [ ] Reativar → `POST /api/employee/update-status` with exactly `{ id, status: "ACTIVE" }` and no `actorId`, with no intermediate modal.
- [ ] After success the same profile stays open and shows status **Ativo**; the list tab does not change.
- [ ] Reativar from the Inativos tab: the row leaves the list after the refetch and the open profile still shows the Target as `ACTIVE`.
- [ ] Actor `MANAGER` on an `INACTIVE` `EMPLOYEE`: Reativar succeeds and Remover was never offered.
- [ ] The reactivated collaborator keeps the same `id` and the same email — this is not a new Create.
- [ ] The list query is invalidated after a successful Reactivate.

## Dependencies

Slices 1, 2 and 3 (3 owns the shared composable, the snapshot and the toast primitive).
