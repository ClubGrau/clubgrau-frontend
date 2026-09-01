import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
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
  }
}

function withScreen(api = stubApi()) {
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
  const composable = app.runWithContext(() => scope.run(() => useEmployeesScreen(api)))
  if (!composable) {
    throw new Error('useEmployeesScreen did not return inside the Vue context')
  }
  return {
    composable,
    api,
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
})
