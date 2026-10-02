import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import type {
  GetOwnEmployeeApi,
  UpdateOwnEmployeeDataApi,
} from '../services/api/employees/types'
import { useAuthStore } from '../stores/auth'
import type { Employee } from '../types/employee'
import { useEmployeesScreen } from './useEmployeesScreen'

vi.hoisted(() => {
  const memory: Record<string, string> = {}
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => memory[key] ?? null,
      setItem: (key: string, value: string) => {
        memory[key] = value
      },
      removeItem: (key: string) => {
        delete memory[key]
      },
      clear: () => {
        for (const key of Object.keys(memory)) delete memory[key]
      },
    },
  })
})

vi.mock('../services/api/employees/http-employees-api', () => ({
  httpEmployeesApi: {
    getEmployees: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    remove: vi.fn(),
    updateMainData: vi.fn(),
    updatePersonalData: vi.fn(),
    updateProfessionalData: vi.fn(),
  },
}))

function listItem(overrides: Partial<Employee.ListItem> = {}): Employee.ListItem {
  return {
    id: 'emp-1',
    name: 'João Silva',
    username: 'joaosilva',
    email: 'joao@grau.pt',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    initials: 'JS',
    ...overrides,
  }
}

function stubApi(item = listItem()) {
  return {
    getEmployees: vi.fn().mockResolvedValue({
      data: [item],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    }),
    create: vi.fn(),
    updateStatus: vi.fn(),
    remove: vi.fn(),
    updateMainData: vi.fn(),
    updatePersonalData: vi.fn(),
    updateProfessionalData: vi.fn(),
  }
}

function jwt(payload: Record<string, unknown>): string {
  const segment = (value: object) => {
    const bytes = new TextEncoder().encode(JSON.stringify(value))
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  }
  return `${segment({ alg: 'none', typ: 'JWT' })}.${segment(payload)}.sig`
}

function stubOwnApi(): GetOwnEmployeeApi & UpdateOwnEmployeeDataApi {
  return {
    getOwnEmployee: vi.fn().mockResolvedValue(listItem()),
    updateOwnEmployeeData: vi.fn(),
  }
}

function withScreen(api = stubApi(), ownApi = stubOwnApi()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: false },
    },
  })
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/login', component: { template: '<div />' } },
    ],
  })
  const app = createApp({})
  app.use(pinia)
  app.use(router)
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() =>
    scope.run(() => useEmployeesScreen(api, ownApi)),
  )
  if (!composable) {
    throw new Error('useEmployeesScreen did not return inside the Vue context')
  }
  const authStore = app.runWithContext(() => useAuthStore())
  return {
    composable,
    api,
    ownApi,
    authStore,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useEmployeesScreen', () => {
  it('uses the injected adapter list as ListItem (already mapped)', async () => {
    const { composable, api, dispose } = withScreen()

    await vi.waitFor(() => {
      expect(api.getEmployees).toHaveBeenCalled()
      expect(composable.filteredEmployees.value).toEqual([listItem()])
    })
    expect(composable.total.value).toBe(1)
    expect(composable.canCreate.value).toBe(false)

    dispose()
  })

  it('opens own employee data when the actor edits themselves from the list', async () => {
    const { composable, ownApi, authStore, dispose } = withScreen()
    authStore.setSession({
      token: jwt({
        id: 'emp-1',
        name: 'João Silva',
        email: 'joao@grau.pt',
        role: 'ADMIN',
        status: 'ACTIVE',
      }),
    })

    await vi.waitFor(() => {
      expect(composable.filteredEmployees.value).toHaveLength(1)
    })

    composable.onEditAction('emp-1')

    expect(composable.isOwnFormOpen.value).toBe(true)
    expect(composable.isEditDrawerOpen.value).toBe(false)
    await vi.waitFor(() => {
      expect(ownApi.getOwnEmployee).toHaveBeenCalledTimes(1)
    })

    dispose()
  })

  it('opens own employee data when the actor edits themselves from the detail panel', async () => {
    const { composable, authStore, dispose } = withScreen()
    authStore.setSession({
      token: jwt({
        id: 'emp-1',
        name: 'João Silva',
        email: 'joao@grau.pt',
        role: 'MANAGER',
        status: 'ACTIVE',
      }),
    })

    await vi.waitFor(() => {
      expect(composable.filteredEmployees.value).toHaveLength(1)
    })

    composable.openDetailDrawer('emp-1')
    composable.openEditDrawer('emp-1')

    expect(composable.drawer.value.open).toBe(false)
    expect(composable.isOwnFormOpen.value).toBe(true)
    expect(composable.isEditDrawerOpen.value).toBe(false)

    dispose()
  })

  it('keeps edit collaborator when the actor edits someone else', async () => {
    const { composable, ownApi, authStore, dispose } = withScreen(
      stubApi(listItem({ id: 'emp-2' })),
    )
    authStore.setSession({
      token: jwt({
        id: 'emp-1',
        name: 'João Silva',
        email: 'joao@grau.pt',
        role: 'ADMIN',
        status: 'ACTIVE',
      }),
    })

    await vi.waitFor(() => {
      expect(composable.filteredEmployees.value[0]?.id).toBe('emp-2')
    })

    composable.onEditAction('emp-2')

    expect(composable.isEditDrawerOpen.value).toBe(true)
    expect(composable.editEmployee.value?.id).toBe('emp-2')
    expect(composable.isOwnFormOpen.value).toBe(false)
    expect(ownApi.getOwnEmployee).not.toHaveBeenCalled()

    dispose()
  })
})
