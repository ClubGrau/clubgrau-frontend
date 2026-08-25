# Slice 2 — Visibility helper and the two surfaces

**Jira:** [KAN-10](https://paulodevmais.atlassian.net/browse/KAN-10) · **Design doc:** [§8 Visibility helper](../../design-docs/employee-lifecycle-v1.md#8-visibility-helper), [§9.1 Row menu and detail header](../../design-docs/employee-lifecycle-v1.md#91-row-menu-and-detail-header) · **Index:** [`README.md`](README.md)

## Objective

Make the operator see the right actions. Today every role sees the same trash control labelled **Remover** that opens the Inativar modal, and that modal offers Remove from any status via “clique aqui”. This slice puts one pure helper behind the row menu and the detail header, renames the actions to **Inativar / Reativar / Remover**, and deletes the Inactivate-then-Remove shortcut.

The buttons become correct here; the commands behind them land in slices 3–5.

## Files

| File | Change |
|------|--------|
| `src/domain/employee-lifecycle.ts` | **new** — `canDeactivate` / `canReactivate` / `canRemove` |
| `src/composables/useEmployeeDrawer.ts` | separate `deactivate` and `remove` modal state; Remove stops being a child of Inactivate |
| `src/composables/useEmployeeSelection.ts` | menu callbacks per action instead of one `onRemove` |
| `src/components/Modal/InactivateModal.vue` | drop the `mode` prop, the `onRemoveAction` emit and the “clique aqui” paragraph |
| `src/views/Employees/Employees.vue` | menu items and modal wiring ask the helper |
| `src/views/Employees/EmployeeDetailPanel.vue` | trash icon replaced by helper-driven actions |
| `src/types/drawer.ts` | `inactivate` and `remove` become distinct modes |

## Contracts

```ts
// src/domain/employee-lifecycle.ts
export interface LifecycleTarget {
  id: string
  role: string        // EmployeeShapped.permission — the Target's Role
  status: EmployeeStatus
}

export function canDeactivate(actor: Actor | null, target: LifecycleTarget): boolean
export function canReactivate(actor: Actor | null, target: LifecycleTarget): boolean
export function canRemove(actor: Actor | null, target: LifecycleTarget): boolean
```

```ts
// src/views/Employees/EmployeeDetailPanel.vue — new props and emits
props:  canDeactivate: boolean, canReactivate: boolean, canRemove: boolean
emits:  deactivate: [], reactivate: [], remove: []   // replaces `delete`
```

## Requirements

1. The helper is pure: no store import, no Vue import. The Actor is passed in by the caller.
2. Rules, mirroring PRD 2.4:

   | Actor.role | Target.role | Target `ACTIVE` / `VACATION` | Target `INACTIVE` |
   |------------|-------------|------------------------------|-------------------|
   | `null` or `EMPLOYEE` | any | none | none |
   | `MANAGER` | `EMPLOYEE` | Inativar | Reativar |
   | `MANAGER` | `MANAGER` / `ADMIN` | none | none |
   | `ADMIN` | any | Inativar | Reativar + Remover |

3. `canDeactivate` is only ever true on `ACTIVE` or `VACATION`. `canReactivate` and `canRemove` are only ever true on `INACTIVE`. **Inativar and Remover are never both visible.**
4. `canRemove` also requires the Actor to be `ADMIN` and returns `false` when `actor.id === target.id`.
5. Self-Deactivate may still show for an ADMIN. Last Admin is **not** in the helper — the list cannot count `ACTIVE` ADMINs, so that refusal arrives as `409` (slices 3 and 5).
6. Views, the overflow menu and `EmployeeDetailPanel` **only** call these three functions. Do not re-derive the matrix in a template.
7. The overflow menu keeps **Editar** unchanged and renders at most one lifecycle action for `ACTIVE`/`VACATION` (Inativar) or up to two for `INACTIVE` (Reativar, then Remover). When the helper allows nothing, only Editar renders.
8. **Never label Deactivate as “Remover”.** Remover appears only when `canRemove` is true.
9. `InactivateModal.vue` becomes a Deactivate-only confirm. Delete the `mode` prop, the `isRemoveMode` computed, the emit and the “clique aqui” paragraph. Keep the filename so the [`AGENTS.md`](../../../AGENTS.md) reference stays valid.
10. `useEmployeeDrawer` exposes `isDeactivateModalOpen` and `isRemoveModalOpen` separately and drops `inactivateModalMode`. `openRemoveDrawer` is reachable only from the INACTIVE fork, never from the Deactivate modal.
11. `EmployeeShapped.permission` is the Target's Role. Do not introduce a second permission type; renaming the field is optional and out of scope.

## Out of scope

- Any HTTP call or mutation. Clicking Inativar still opens the confirm modal whose primary button does nothing until slice 3; Reativar and Remover are wired in slices 4 and 5.
- Vacation actions (put on vacation / leave vacation). `VACATION` stays a badge, a tab and a row status.
- The Editar flow.
- Bulk actions from the row checkboxes.

## Acceptance criteria

- [ ] Actor `EMPLOYEE` (or a token without a role): no Inativar, Reativar or Remover anywhere — row menu shows Editar only.
- [ ] Actor `MANAGER`, Target `EMPLOYEE` `ACTIVE` → Inativar visible, Remover hidden.
- [ ] Actor `MANAGER`, Target `EMPLOYEE` `INACTIVE` → Reativar visible, Remover hidden.
- [ ] Actor `MANAGER`, Target `MANAGER` or `ADMIN`, any status → no lifecycle action.
- [ ] Actor `ADMIN`, Target `INACTIVE` → Reativar **and** Remover; Inativar absent.
- [ ] Any Target `ACTIVE` or `VACATION` → Remover never appears.
- [ ] Actor `ADMIN` viewing their own row → Remover hidden.
- [ ] The Inativar modal no longer contains “clique aqui” and there is no path from it to Remove.
- [ ] The row menu never uses the word “Remover” for a Deactivate.
- [ ] The detail header trash icon is gone; the detail shows the same actions as the row menu for that Target.

## Dependencies

Slice 0 — the helper needs an Actor.
