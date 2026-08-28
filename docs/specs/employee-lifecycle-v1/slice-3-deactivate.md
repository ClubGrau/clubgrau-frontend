# Slice 3 — Deactivate: confirm, mutation, close the drawer

**Jira:** [KAN-11](https://paulodevmais.atlassian.net/browse/KAN-11) · **Design doc:** [§9.2](../../design-docs/employee-lifecycle-v1.md#92-deactivate-confirm), [§11 Detail snapshot](../../design-docs/employee-lifecycle-v1.md#11-detail-snapshot), [§13](../../design-docs/employee-lifecycle-v1.md#13-sequences) · **Index:** [`README.md`](README.md)

## Objective

Make Inativar real. Confirming the modal calls `update-status` with `INACTIVE`. On success the confirm modal and the drawer both close — the operator is **not** left on the Target's profile. They reach the INACTIVE fork later from Inativos or Todos.

This slice also lands the toast primitive the whole feature needs — the repo has none today.

## Files

| File | Change |
|------|--------|
| `src/composables/useEmployeeLifecycle.ts` | **new** — the `updateStatus` mutation, error mapping, toasts, invalidation |
| `src/composables/useToast.ts` | **new** — minimal toast queue |
| `src/components/Toast/ToastHost.vue` | **new** — renders the queue |
| `src/Layout/AppContainer.vue` | mounts `ToastHost` once |
| `src/composables/useEmployeeDrawer.ts` | Target snapshot: a still-open profile survives leaving the current page (used by later slices; Deactivate success closes the drawer) |
| `src/components/Modal/InactivateModal.vue` | copy per §9.2 |
| `src/views/Employees/Employees.vue` | wires confirm → mutation → close drawer |

## Contracts

```ts
// src/composables/useEmployeeLifecycle.ts
export function useEmployeeLifecycle(api: EmployeesApi, options: {
  onStatusChanged: (result: UpdateEmployeeStatusResult) => void
}) {
  deactivate(id: string): void
  isDeactivating: Ref<boolean>
  // reactivate / remove are added in slices 4 and 5
}
```

```ts
// src/composables/useEmployeeDrawer.ts — added
targetSnapshot: Ref<EmployeeShapped | null>
patchSnapshotStatus(status: EmployeeStatus): void
clearSnapshot(): void
// `detailEmployee` prefers the live list row and falls back to the snapshot
```

```ts
// src/composables/useToast.ts
type ToastVariant = 'success' | 'error'
function useToast(): { toasts: Ref<Toast[]>; push(variant: ToastVariant, message: string): void; dismiss(id: string): void }
```

## Requirements

1. `useMutation` with `retry: 0`. On success, `queryClient.invalidateQueries({ queryKey: ['employees'] })`.
2. Body is `{ id, status: 'INACTIVE' }`. No `actorId`.
3. On `200`, close the confirm modal **and** the drawer. **Do not open** the Target's detail. **Do not switch the list tab.**
4. Opening the confirm from the row menu or from a still-open profile has the same success outcome: everything closes. The operator is not dropped onto the INACTIVE fork.
5. **Snapshot.** `detailEmployee` is `employees.find(id)` today, which misses once the current tab refetches without the row. The drawer keeps the last shaped Target plus a status patch so a **still-open** profile can survive a list refetch (Reactivate in slice 4). Deactivate success drops the snapshot via `closeDrawer()`.
6. Modal copy (§9.2), reusing `ModalLayout`: Inativar is an operational stop; the person stays on the list; the original email stays occupied; they can be Reativados later. Primary button **Inativar**. No password field. No link to Remove.
7. Toasts:
   - `200` → “Colaborador inativado. Você pode reativá-lo pelo perfil.”
   - `409` `LAST_ADMIN` → “É preciso existir outro Administrador ativo antes desta ação.” Keep the confirm modal open and do not change the status.
   - `403` → “Ação não permitida.” Should be rare if slice 2 is correct.
   - `400` / `CONFLICT` / `UNKNOWN` → show the `error` string from the API.
   - `401` → treated as a session problem, not as a Deactivate failure.
8. The confirm button is disabled while the mutation is in flight so a double click cannot fire two requests.
9. Toasts auto-dismiss after ~5s, are dismissible, stack, and are rendered once at the layout level — not per view.

## Out of scope

- Reactivate (slice 4) and Remove (slice 5), even though they use the same composable.
- Optimistic list updates. The list refetches.
- An i18n locale file for the Employees view; copy is inline like the rest of that screen today.
- Any toast beyond `success` and `error`.

## Acceptance criteria

- [ ] Inativar → confirm → `POST /api/employee/update-status` with exactly `{ id, status: "INACTIVE" }` and no `actorId`.
- [ ] After success, the confirm modal and the drawer close; the list tab is unchanged; the Target's detail does **not** open.
- [ ] Inativar from the Ativos tab: the row disappears from the list after the refetch.
- [ ] Inativar from the row menu, with no drawer open: after success no detail opens.
- [ ] The confirm modal shows no password field and no “clique aqui”.
- [ ] Last Admin case: `409` shows the Last Admin copy, the confirm modal stays open and the status stays `ACTIVE`.
- [ ] Double-clicking the primary button sends one request.
- [ ] The list query is invalidated after a successful Deactivate.

## Dependencies

Slices 1 and 2.
