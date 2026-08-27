# Slice 1 — HTTP `updateStatus` + `remove`

**Jira:** [KAN-9](https://paulodevmais.atlassian.net/browse/KAN-9) · **Design doc:** [§10 HTTP (client contract)](../../design-docs/employee-lifecycle-v1.md#10-http-client-contract) · **Index:** [`README.md`](README.md)

## Objective

Teach the employees port to write. `HttpEmployeesApi` only reads today, so Inativar is a `console.log` and Remove has no HTTP at all. This slice adds `updateStatus` and `remove` behind typed ports, plus the single place that turns an Axios failure into a lifecycle error the UI can branch on.

No screen changes. It unblocks slices 3, 4 and 5.

## Files

| File | Change |
|------|--------|
| `src/services/api/employees/types.ts` | new params/results and the write ports |
| `src/services/api/employees/http-employees-api.ts` | implements the two commands |
| `src/domain/lifecycle-error.ts` | **new** — `toLifecycleError` |

## Contracts

```ts
// src/services/api/employees/types.ts
/** Statuses this feature may send. REMOVED is terminal and VACATION is out of scope. */
export type EmployeeLifecycleStatus = 'ACTIVE' | 'INACTIVE'

export interface UpdateEmployeeStatusParams {
  id: string
  status: EmployeeLifecycleStatus
}

export interface UpdateEmployeeStatusResult {
  id: string
  status: EmployeeStatus
}

export interface RemoveEmployeeParams {
  id: string
  password: string
}

export interface RemoveEmployeeResult {
  id: string
}

export interface UpdateEmployeeStatusApi {
  updateStatus(params: UpdateEmployeeStatusParams): Promise<UpdateEmployeeStatusResult>
}

export interface RemoveEmployeeApi {
  remove(params: RemoveEmployeeParams): Promise<RemoveEmployeeResult>
}

export interface EmployeesApi
  extends GetEmployeesApi, UpdateEmployeeStatusApi, RemoveEmployeeApi {}
```

```ts
// src/domain/lifecycle-error.ts
export type LifecycleErrorCode =
  | 'BAD_REQUEST'      // 400
  | 'UNAUTHORIZED'     // 401 — Actor password / Actor not usable
  | 'FORBIDDEN'        // 403 — authority matrix
  | 'LAST_ADMIN'       // 409 — Last Admin must stay ACTIVE
  | 'NOT_INACTIVE'     // 409 — Remove attempted on a non-INACTIVE Target
  | 'ALREADY_REMOVED'  // 409
  | 'CONFLICT'         // 409, unrecognised
  | 'UNKNOWN'          // network / no response

export interface LifecycleError {
  code: LifecycleErrorCode
  /** Raw `error` string from the API, for fallback copy. */
  message: string
}

export function toLifecycleError(error: unknown): LifecycleError
```

## Requirements

1. `HttpEmployeesApi implements EmployeesApi`. Keep the exported `httpEmployeesApi` singleton.
2. `POST /api/employee/update-status` with body **exactly** `{ id, status }`. Success `200` → `{ id, status }` after the interceptor unwrap.
3. `POST /api/employee/remove` with body **exactly** `{ id, password }`. Success `200` → `{ id }` after unwrap.
4. **No `actorId` in any body.** Authorization comes from the existing request interceptor in `src/services/api/config.ts`.
5. The success envelope is already unwrapped by the shared response interceptor. Do not read `response.data.data` again.
6. Error bodies keep the shape `{ error: string }` on `error.response.data`.
7. `toLifecycleError` branches on **HTTP status first**, then on the English `error` string for `409`. Match these exact strings, not any Portuguese the server may return:
   - `401` → `Authentication failed`
   - `403` → `Action not allowed`
   - `409` `Last Admin must stay ACTIVE until another Admin exists` → `LAST_ADMIN`
   - `409` `Employee is not inactive` → `NOT_INACTIVE`
   - `409` `Employee is already removed` → `ALREADY_REMOVED`
   - any other `409` → `CONFLICT`
8. A request with no response (network failure, timeout) is `UNKNOWN`.
9. `EmployeeLifecycleStatus` must make `'REMOVED'` and `'VACATION'` un-typeable on `updateStatus`. `EmployeeApiStatus` on the list query is unchanged and still accepts `VACATION`.
10. `GET /api/employees` already excludes `REMOVED`. Do not add a Removed filter.

## Out of scope

- Any Vue component, composable or mutation. Wiring lands in slices 3–5.
- Retry or refresh-token behaviour.
- Operator copy for each error code — that is per-slice, in 3, 4 and 5.

## Acceptance criteria

- [ ] `updateStatus({ id, status: 'INACTIVE' })` issues `POST /api/employee/update-status` with a body of exactly two keys and returns `{ id, status }`.
- [ ] `remove({ id, password })` issues `POST /api/employee/remove` with a body of exactly two keys and returns `{ id }`.
- [ ] Every request carries `Authorization: Bearer <token>` and no request body anywhere contains `actorId`.
- [ ] `updateStatus({ id, status: 'REMOVED' })` fails to compile.
- [ ] `toLifecycleError` returns `LAST_ADMIN` for a `409` whose `error` is `Last Admin must stay ACTIVE until another Admin exists`, and `CONFLICT` for an unrecognised `409`.
- [ ] `toLifecycleError` returns `UNAUTHORIZED` for `401`, `FORBIDDEN` for `403`, `BAD_REQUEST` for `400`, `UNKNOWN` when there is no response.
- [ ] `npm run build` passes.

## Dependencies

Slice 0 is not strictly required to compile this slice, but it is scheduled first.
