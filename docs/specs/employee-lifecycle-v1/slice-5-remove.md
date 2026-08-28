# Slice 5 — Remove: step-up modal, mutation, close and toast

**Jira:** [KAN-13](https://paulodevmais.atlassian.net/browse/KAN-13) · **Design doc:** [§9.3](../../design-docs/employee-lifecycle-v1.md#93-remove-step-up), [§9.4](../../design-docs/employee-lifecycle-v1.md#94-toasts), [§13](../../design-docs/employee-lifecycle-v1.md#13-sequences) · **PRD:** [Rule 2.6](../../prd/employee-lifecycle-v1.md) · **Index:** [`README.md`](README.md)

## Objective

Close the destructive half of the INACTIVE fork. An ADMIN confirms with **their own** password, the Target leaves the platform, the drawer closes, and the operator is told the original email is free for a **new** Create — a new identity that inherits nothing from the removed id.

## Files

| File | Change |
|------|--------|
| `src/components/Modal/RemoveEmployeeModal.vue` | **new** — own component, Actor password |
| `src/composables/useEmployeeLifecycle.ts` | adds `remove` |
| `src/views/Employees/Employees.vue` | opens the modal from the fork and handles the outcome |

## Contracts

```ts
// src/components/Modal/RemoveEmployeeModal.vue
props: employeeName: string, isSubmitting: boolean, errorMessage: string | null
emits: submit: [password: string], cancel: []
```

```ts
// src/composables/useEmployeeLifecycle.ts — added
remove(params: { id: string; password: string }): void
isRemoving: Ref<boolean>
removeError: Ref<string | null>
```

## Requirements

1. **Own component.** Do not reuse the Inativar body behind a mode flag — that flag is exactly the shortcut slice 2 deleted.
2. **One password field: the Actor's.** No `passwordConfirmation`, never the Target's password, and no typing the Target's name. Reuse `PasswordRevealler` for the show/hide control, as Login does.
3. Body is `{ id, password }`. No `actorId` — the API stamps the Actor from the JWT.
4. Copy (PRD 2.6): the action is irreversible; the collaborator disappears from the list; the original email becomes free; a later Create with that email is a **new** identity and does not inherit the history bound to the removed id. Primary button **Remover**.
5. On `200`: close the modal **and** the drawer, drop the Target snapshot, invalidate `['employees']`, and toast “Saiu da equipe. O email original está livre para um cadastro novo.” The Target must be gone from the list — a removed profile must never render, because its fields are sentinels.
6. On `401`: **stay on the modal** with an opaque credentials message, the same wording Login already uses for a failed authentication. Do not distinguish a wrong password from an unusable Actor. Do not close the drawer, do not refetch.
7. On `409` `LAST_ADMIN`: close the modal, keep the profile open, and toast “É preciso existir outro Administrador ativo antes desta ação.”
8. On `409` `NOT_INACTIVE` or `ALREADY_REMOVED`: keep the profile open, toast the API `error`, and refetch the list — the client's view of that Target is stale.
9. On `403`: “Ação não permitida.” Slice 2 should have hidden the control.
10. **Never persist the password.** It lives in local component state, is cleared when the modal closes or unmounts, and is never written to the store, `localStorage` or a log.
11. Submit is disabled while empty or while a request is in flight, so a double click cannot fire two Anonymize attempts.
12. The modal is only reachable when `canRemove` is true: Actor `ADMIN`, Target `INACTIVE`, and not the Actor themselves.

## Out of scope

- Hard delete, audit UI, or a `?status=REMOVED` filter.
- Undo. Remove has no undo — that is why it is gated by a password.
- Rate limiting or lockout after repeated wrong passwords.
- What downstream modules do with a `REMOVED` `employeeId`.

## Acceptance criteria

- [ ] Actor `ADMIN`, Target `INACTIVE`, correct password → `POST /api/employee/remove` with exactly `{ id, password }` and no `actorId`; the modal and drawer close; the row is gone after the refetch; the toast mentions that the original email is free for a new Create.
- [ ] Wrong password → `401`; the modal stays open with an opaque message; the list is unchanged; the drawer stays open.
- [ ] Last Admin → `409`; the profile stays open with the Last Admin copy; the Target is still on the list.
- [ ] Actor `MANAGER` never reaches this modal, and `POST /api/employee/remove` is never issued from a MANAGER session.
- [ ] `ACTIVE` / `VACATION` Target: Remover is not offered anywhere.
- [ ] After a successful Remove, no profile with sentinel data is left on screen.
- [ ] The password never appears in `localStorage`, in the store, or in a console log.
- [ ] Two ADMINs: A removes an `INACTIVE` B and A is still on the list.
- [ ] The original email can then be used on a new Create and produces a different `id`.

## Dependencies

Slices 1, 2 and 3.
