# grau-frontend — System Constitution

> Global guide for AI agents and developers.
> Application-wide rules live **here**. Product language lives in [`CONTEXT.md`](CONTEXT.md). Feature shape lives in `docs/prd/` and `docs/design-docs/`.

## Documentation hierarchy

| Document | Role |
|----------|------|
| [`CONTEXT.md`](CONTEXT.md) | Glossary. What a term *is*. No Vue, no HTTP, no folders. |
| [`AGENTS.md`](AGENTS.md) (this file) | Constitution: architecture, rules, patterns, conventions. |
| `docs/prd/<feature>.md` | Product rules for a feature. |
| `docs/design-docs/<feature>.md` | Frontend shape of that feature (screens, client, errors). |

**What to update when**

- A domain term is sharpened → `CONTEXT.md` only.
- A global pattern changes (composable, HTTP client, store) → this file.
- Product rules change → the feature PRD. Do not copy the matrix into this file.
- Screen/client shape changes → the feature design doc.
- Do not treat these files as a changelog for cosmetic commits.

---

## Constitution

`grau-frontend` is a **Vue 3 + TypeScript + Vite** operator app. It talks to `grau-api` over HTTP. It does **not** own lifecycle invariants (authority matrix, Last Admin, Anonymize). The API enforces those; the UI hides or shows actions for the operator.

- Screens live under `src/views/`.
- Reusable UI lives under `src/components/`.
- Feature orchestration lives under `src/composables/`.
- Pure helpers live under `src/domain/`.
- HTTP lives under `src/services/api/<resource>/`.
- Session lives under `src/stores/`.
- Shared TypeScript shapes live under `src/types/`.

Stack in use: Vue 3 `<script setup>`, Vue Router, Pinia (persisted), TanStack Vue Query, Axios, vue-i18n, Tailwind CSS 4.

Tests run with Vitest (`npm run test`).

---

## Architecture

```text
composition root (use<Screen>)
  → use-case composable (1 lista ou 1 comando)
      → port (1 verbo)
          → Http*Api
  → domain (visibilidade, validação, toApiError)
  → view (render + emit)
```

The Pinia auth store is session only. The view does not sit on the HTTP path.

### Hard rules

1. **Views do not call Axios and do not import `http*Api`.** The composition root (`useEmployeesScreen`, and the equivalent on the next feature) instantiates the adapter **once** and injects the thin port into each composable. The view renders and emits.
2. **Who calls a verb depends only on that port.** HTTP clients implement a TypeScript port per verb (`GetEmployeesApi`, `CreateEmployeeApi`, …). Do not export `type FooApi = A & B`. Intersection lives only on the adapter class / the root’s default argument.
3. **The Actor is the Bearer token.** Never send `actorId` in a JSON body. The API stamps it from the JWT.
4. **Actor Role drives visible actions.** Decode the JWT on login (and on a persisted token) and keep `id` + `role` (+ `status`) in the auth store. There is no separate permission catalog in this version. Role ≠ permission.
5. **Lifecycle visibility is a helper, not ad-hoc `if`s.** `lifecycleActions(actor, target)` (and the individual `canDeactivate` / `canReactivate` / `canRemove` it wraps) plus `canCreate(actor)` take Actor (role) and, for the cycle, Target (role + status). Views and menus only ask those helpers. Last Admin is **not** in the helper: the list does not say how many `ACTIVE` ADMINs exist; that refusal is HTTP `409`.
6. **Hiding a button is not authorization.** The API returns `403` / `409` / `401`. The UI must handle those codes even when it already hid the action.
7. **Do not put the authority matrix only in Vue.** Mirror it for UX from Role (+ Target Role/status). The server is the source of truth.
8. **Three shapes: Entity (GET) ≠ ListItem (UI) ≠ Command (write).** Mapper in the **adapter**, only what the API sends plus explicit derivatives (`initials`). Views consume the shaped type, not the raw payload.
9. **Product copy and glossary stay aligned.** UI labels in Portuguese; canonical terms in [`CONTEXT.md`](CONTEXT.md) stay in English (`Deactivate`, `Reactivate`, `Remove`, `Create`, `Role`). Do not label Deactivate as “Remover”. Do not label Role as “Permissão”.
10. **Errors go through `toApiError`.** The domain helper reads `{ response: { status, data: { error } } }` without importing Axios. Copy lives in i18n; never toast the English API string.
11. **Query keys** live in `services/api/<resource>/query-keys.ts`.
12. **A new feature is born with `src/views/<View>/locales/`.** Employees is the template, not the anti-template. The **next** feature namespaces composables under `src/composables/<context>/`. Employees **does not move** in this block — do not mix a folder rename with behaviour.
13. **Composable tests stub the port they use.** Do not stub unrelated verbs. An in-memory adapter exists only when there are two real adapters.

### Axios envelope

`src/services/api/config.ts` unwraps `{ data: … }` from successful API responses. After the interceptor, `response.data` **is** the inner payload (list, `{ id }`, `{ token }`). Error bodies remain `{ error }` on the Axios error response.

Auth: request interceptor reads `useAuthStore().token` and sets `Authorization: Bearer`.

---

## Folder map

```text
src/
├── views/                 # route-level screens (Employees, Login, Dashboard)
│   └── <View>/locales/    # feature copy (pt default, en fallback)
├── components/            # reusable UI (Drawer, Modal, StatusBadge, …)
├── Layout/                # authenticated shell
├── composables/           # useEmployeesScreen, use-case composables
│   └── <context>/         # next feature only — Employees stays flat
├── domain/                # pure helpers (JWT decode, lifecycle, toApiError)
├── services/api/          # Axios instance + one folder per resource
│   ├── config.ts
│   ├── auth/
│   └── employees/
├── stores/                # Pinia (auth token, persisted)
├── types/                 # shared TS types (Employee, Account, Actor, …)
├── constants/             # UI maps (status → badge)
├── query/                 # QueryClient + VueQueryPlugin
├── routes/
└── i18n/                  # shared locales + loadMessages
```

### Where to put types

| Kind | Folder |
|------|--------|
| Domain / API entity the UI understands | `src/types/` (namespace when it grows, e.g. `Employee.Entity`) |
| HTTP port + request params | `src/services/api/<resource>/types.ts` |
| UI-only view model | same `src/types/` file or next to the view if it never leaks |
| Badge / filter option maps | `src/constants/` |
| Pure, framework-free modules (no Vue / Axios / Pinia) | `src/domain/` |

---

## Conventions

### Naming

| Artifact | Pattern | Example |
|----------|---------|---------|
| View / component | `PascalCase.vue` | `Employees.vue`, `InactivateModal.vue` |
| Composition root | `use<Screen>` | `useEmployeesScreen` |
| Use-case composable | `useX.ts` | `useEmployees.ts`, `useCreateEmployee.ts` |
| HTTP adapter | `http-<resource>-api.ts` | `http-employees-api.ts` |
| Mapper | `map-<resource>.ts` | `map-employee.ts` |
| Pinia store | `src/stores/<name>.ts` | `auth.ts` → `useAuthStore` |
| Query key | `employeeQueryKeys` in `services/api/<resource>/query-keys.ts` | `employeeQueryKeys.list(params)` |

### Composable split (Employees as template)

| Composable | Owns |
|------------|------|
| `useEmployeesScreen` | composition root: adapter once, injects ports, wires callbacks |
| `useEmployees` | list query, filters, pagination |
| `useEmployeeDrawer` | which panel/modal is open and which id is active |
| `useEmployeeSelection` | overflow menu (edit / lifecycle) |
| `useCreateEmployee` | Create mutation |
| `useDeactivateEmployee` | Deactivate mutation |
| `useReactivateEmployee` | Reactivate mutation |
| `useRemoveEmployee` | Remove mutation |
| `useLogin` | credentials form + login mutation |

A use-case composable takes the thin port it needs (`useEmployees(getEmployeesApi)`). It does **not** import `httpEmployeesApi`. The composition root imports the adapter once (overridable for a root test) and injects each port.

### TanStack Query

- Lists: `useQuery` with a stable `queryKey` that includes filters/page.
- Writes: `useMutation`; `retry: 0` (global default). After success, `refetch` or invalidate the list key.
- Global defaults: `staleTime` 1 minute, `retry` 1 on queries, `refetchOnWindowFocus: false`.

### Tests

Vitest (`npm run test`). A composable test stubs **only** the port that composable uses. Domain tests cover `lifecycleActions`, `canCreate`, `toApiError`. Mapper tests stay next to the mapper. HTTP adapter tests assert the list is already `ListItem` (including `initials`).

### i18n

Default locale `pt`. Shared strings in `src/i18n/locales/`. Screen-specific strings in `src/views/<View>/locales/<locale>.json` (loaded by `loadMessages`).

### Auth session

`useAuthStore` persists `token` in `localStorage`. `actor` (`id`, `role`, `status`) is a `computed` from the JWT payload and is never persisted on its own. Router `beforeEnter` on `/app` sends the operator to `/login` when there is no token. `beforeEnter` on `/login` sends them to `/app` when the store already has an Actor (a decodable token). There is no `/me` endpoint in this app today. `exp` is not checked on the client.

---

## Playbooks

### New list screen

1. Port + params in `services/api/<resource>/types.ts`.
2. `Http*Api` using `api` from `config.ts`.
3. Mapper **in the `Http*Api`**, not in `useQuery`. Port returns `ListItem`, not `Entity`.
4. Use-case composable with `useQuery` (filters reset `currentPage` to 1).
5. Composition root `use<Screen>` instantiates the adapter and injects the list port. The root is **not** the `.vue`.
6. View under `src/views/` + route child of `/app`. View does not import `http*Api`.

### New write command

1. Dedicated port for the verb (`CreateEmployeeApi`, `UpdateEmployeeStatusApi`, …). The composable depends **only** on that port — not on a fat `EmployeesApi` union.
2. One composable per command (`useCreateEmployee`, `useDeactivateEmployee`, …). Do not add a mutation to a composable that already owns another command.
3. `useMutation` in the composable — not in the `.vue` except for wiring emit/submit.
4. The composition root is **not** the `.vue`. The view does not instantiate the mutation with `http*Api`.
5. Do not send fields the API stamps from the JWT.
6. Map HTTP `400` / `401` / `403` / `409` to **i18n keys** (or `null` for `401`); the composable calls `t(key)` and passes the translated string to `useToast`. Operator copy of the feature lives in `src/views/<View>/locales/`.
7. On success, invalidate with `employeeQueryKeys.all` (pattern: `src/services/api/<resource>/query-keys.ts`); close the modal/drawer.
8. Visibility in the view goes through `lifecycleActions` / `canCreate`, not loose `can*` calls.

### New reusable UI

Put it in `src/components/<Name>/` when more than one view will use it. Keep feature-only panels next to the view (`EmployeeDetailPanel.vue`).

---

## Do / Don’t

| Do | Don’t |
|----|-------|
| Instantiate the adapter once in `use<Screen>` | Import `http*Api` in a `.vue` file |
| Inject the thin port into the use-case composable | Call `api.get` from a view |
| One port per verb | `type EmployeesApi = A & B` |
| Map in the adapter | Map inside `useQuery` |
| `toApiError` + i18n keys | Toast the English `{ error }` string |
| Use Role / **Função** | Name a field `permission` / “Permissão” |
| Use `Deactivate` / `Reactivate` / `Remove` as in `CONTEXT.md` | Label Inativar as “Remover” in the overflow menu |
| Handle `401` / `403` / `409` from lifecycle commands | Assume a hidden button means the request cannot happen |
| Keep glossary changes in `CONTEXT.md` | Dump Vue folder trees into `CONTEXT.md` |
| Update this file when the composable/HTTP pattern changes | Log every CSS tweak here |

---

## Quick references

| Resource | Path |
|----------|------|
| Glossary | [`CONTEXT.md`](CONTEXT.md) |
| Employee lifecycle PRD | [`docs/prd/employee-lifecycle-v1.md`](docs/prd/employee-lifecycle-v1.md) |
| Employee lifecycle design | [`docs/design-docs/employee-lifecycle-v1.md`](docs/design-docs/employee-lifecycle-v1.md) |
| List template | `src/composables/useEmployeesScreen.ts` + `useEmployees.ts` + `src/services/api/employees/` |
| Axios instance | `src/services/api/config.ts` |
| Query client | `src/query/index.ts` |
| Router / auth guard | `src/routes/index.ts` |
