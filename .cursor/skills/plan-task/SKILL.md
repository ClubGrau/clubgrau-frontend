---
name: plan-task
description: >
  Busca uma Jira issue (KAN-N) e gera um plano de implementação estruturado
  alinhado à arquitetura do grau-frontend (Vue 3 + TypeScript + Vite).
  Otimizado para mínimo de tool calls e tokens: cloudId fixo, resposta em
  markdown, exploração cirúrgica do codebase via labels + AGENTS.md.
  Use quando o usuário escrever "/plan-task KAN-N" ou pedir um plano
  de implementação para uma task do board KAN.
---

# plan-task

Gera um plano de implementação para uma Jira issue do board **KAN** (`paulodevmais.atlassian.net`).

## Defaults fixos (nunca chamar `getAccessibleAtlassianResources`)

| Campo | Valor |
|-------|-------|
| `cloudId` | `paulodevmais.atlassian.net` |
| Project | `KAN` |
| `responseContentFormat` | `"markdown"` ← **obrigatório** — evita ADF verboso |

---

## Workflow (executar nesta ordem exata)

### Passo 1 — buscar a issue (1 tool call)

```
getJiraIssue(
  cloudId: "paulodevmais.atlassian.net",
  issueIdOrKey: "<KAN-N>",
  responseContentFormat: "markdown"
)
```

Extrair apenas:
- `summary`
- `description` (markdown)
- `issueType.name` (Tarefa / História / Epic)
- `status.name`
- `labels` → usados para identificar o recurso
- `priority.name`
- Bloqueadores em `issuelinks` (se existirem)

Não chamar Confluence, issues relacionadas nem épicos, a menos que a descrição da issue referencie explicitamente uma URL de Confluence.

### Passo 2 — identificar o recurso impactado (0–1 leituras)

Usar os `labels` da issue para mapear o recurso:

| Label (prefixo) | Recurso |
|-----------------|---------|
| `employees` / `employee-*` | `employees` → `src/services/api/employees/`, `src/views/Employees/`, `src/composables/use*Employees*` |
| `auth` / `login` | `auth` → `src/services/api/auth/`, `src/stores/auth.ts`, `src/views/Login/` |
| `commissions` / `commission-*` | `commissions` → `src/services/api/commissions/`, `src/views/Commissions/` |
| `dashboard` | `dashboard` → `src/views/Dashboard/` |

Se o label não mapear diretamente, ler `AGENTS.md` (seção "Quick references") para encontrar o recurso correto.

Com o recurso identificado, ler o design doc correspondente em **`docs/design-docs/<feature>.md`** (se existir) para entender o contrato atual de telas, composables e erros mapeados.

**Não** explorar todos os arquivos do recurso. O design doc + AGENTS.md são suficientes para o plano.

### Passo 3 — classificar o trabalho

Com base no `issueType` e na descrição, classificar cada entrega em uma das categorias do playbook:

- **New list screen** → port + Http\*Api + mapper + composable + view + rota
- **New write command** → método no port + `useMutation` no composable + modal/drawer + tratamento de erros HTTP
- **New reusable UI** → componente em `src/components/` + i18n
- **Domain change** → helper puro em `src/domain/` (sem Vue / Axios / Pinia)
- **Store change** → ajuste em `src/stores/` (ex.: novo campo no `useAuthStore`)
- **Type / constant change** → `src/types/` ou `src/constants/`

### Passo 4 — gerar o plano

Produzir o plano no formato abaixo. Não repetir a descrição da issue; focar no **o que fazer e em qual camada**.

---

## Formato de saída

```markdown
## Plano — <summary da issue>

**Issue:** [KAN-N](https://paulodevmais.atlassian.net/browse/KAN-N)
**Tipo:** <issueType> | **Status:** <status> | **Recurso:** `<recurso>`

---

### Classificação
<New list screen / New write command / New reusable UI / Domain change / …>

---

### Passos

#### 1. Types
- [ ] `src/types/<type>.ts` — shape do recurso (se ainda não existe ou precisa de campo novo)

#### 2. HTTP API
- [ ] Port: `src/services/api/<resource>/types.ts` — params + port interface
- [ ] Adapter: `src/services/api/<resource>/http-<resource>-api.ts`
- [ ] Mapper: `src/services/api/<resource>/map-<resource>.ts` (se o view model for mais rico que o payload)

#### 3. Domain (se aplicável)
- [ ] `src/domain/<helper>.ts` — helper puro (sem Vue / Axios / Pinia) + spec `.test.ts`

#### 4. Store (se aplicável)
- [ ] `src/stores/<name>.ts` — novo campo ou computed no store Pinia

#### 5. Composable
- [ ] `src/composables/use<Feature>.ts` — `useQuery` para listas, `useMutation` para comandos
  - Filtros resetam `currentPage` para 1
  - Após mutação: invalidar ou refetch da query key da lista
  - `retry: 0` em mutations

#### 6. View / Componente
- [ ] `src/views/<Feature>/<Feature>.vue` (screen) ou `src/components/<Name>/<Name>.vue` (reutilizável)
- [ ] Modais / drawers de suporte (ex.: `<Action>Modal.vue`)

#### 7. i18n
- [ ] `src/views/<Feature>/locales/pt.json` (e `en.json`) — strings novas
- [ ] Shared strings em `src/i18n/locales/` apenas se usadas por mais de uma view

#### 8. Rota (se screen nova)
- [ ] `src/routes/index.ts` — rota filha de `/app`

#### 9. Erros HTTP
- [ ] Mapear `400` / `401` / `403` / `409` para copy do operador conforme design doc

#### 10. Artefatos finais
- [ ] Atualizar `docs/design-docs/<feature>.md` se o contrato de tela mudou
- [ ] Atualizar `AGENTS.md` (seção Quick references) se um novo composable/port foi adicionado

---

### Decisões em aberto
- <questão que precisa ser resolvida antes de codar, se houver>

### Dependências
- <bloqueadores de outras issues, se houver — caso contrário omitir>
```

---

## Regras de economia de tokens

1. **Nunca** chamar `getAccessibleAtlassianResources` — `cloudId` é fixo.
2. **Sempre** usar `responseContentFormat: "markdown"` em toda chamada Atlassian.
3. **Nunca** ler arquivos do recurso além do design doc identificado e `AGENTS.md`.
4. **Nunca** buscar o épico pai ou issues filhas automaticamente.
5. **Nunca** chamar Confluence a menos que a descrição da issue contenha uma URL `confluence.atlassian.net`.
6. **Máximo de 3 tool calls** para produzir o plano:
   - `getJiraIssue` (obrigatório)
   - Leitura de `docs/design-docs/<feature>.md` (se o recurso não for claro pelos labels)
   - Leitura de `AGENTS.md` (somente se o recurso ainda não for identificado)
7. **Omitir passos** que claramente não se aplicam à classificação (ex.: Domain change não precisa dos passos de View nem de Rota).
