import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import type {
  GetOwnEmployeeApi,
  UpdateOwnEmployeeDataApi,
} from '../../services/api/employees/types'
import { useAuthStore } from '../../stores/auth'
import type { Employee } from '../../types/employee'
import { useOwnEmployeeScreen } from './useOwnEmployeeScreen'

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

function jwt(payload: Record<string, unknown>): string {
  const segment = (value: object) => {
    const bytes = new TextEncoder().encode(JSON.stringify(value))
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  }
  return `${segment({ alg: 'none', typ: 'JWT' })}.${segment(payload)}.sig`
}

function employee(name = 'João Silva'): Employee.ListItem {
  return {
    id: 'emp-1',
    name,
    username: 'joao',
    email: 'joao@grau.pt',
    role: 'EMPLOYEE',
    phone: '+351912345678',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    initials: 'JS',
  }
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function withScreen(api: GetOwnEmployeeApi & UpdateOwnEmployeeDataApi) {
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
      { path: '/app', component: { template: '<div />' } },
    ],
  })
  const app = createApp({})
  app.use(pinia)
  app.use(router)
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() => scope.run(() => useOwnEmployeeScreen(api)))
  if (!composable) {
    throw new Error('useOwnEmployeeScreen did not return inside the Vue context')
  }
  const authStore = app.runWithContext(() => useAuthStore())
  return {
    composable,
    authStore,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useOwnEmployeeScreen', () => {
  it('loads the profile only after the form opens', async () => {
    const getOwnEmployee = vi.fn().mockResolvedValue(employee())
    const { composable, dispose } = withScreen({
      getOwnEmployee,
      updateOwnEmployeeData: vi.fn(),
    })

    await flushPromises()
    expect(getOwnEmployee).not.toHaveBeenCalled()

    composable.openForm()
    await flushPromises()
    await flushPromises()

    expect(getOwnEmployee).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('replaces the session token when a name save returns one', async () => {
    const previous = jwt({
      id: 'emp-1',
      name: 'João Silva',
      email: 'joao@grau.pt',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    })
    const reissued = jwt({
      id: 'emp-1',
      name: 'Maria Silva',
      email: 'joao@grau.pt',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    })
    const updateOwnEmployeeData = vi.fn().mockResolvedValue({
      employee: employee('Maria Silva'),
      token: reissued,
    })
    const { composable, authStore, dispose } = withScreen({
      getOwnEmployee: vi.fn().mockResolvedValue(employee()),
      updateOwnEmployeeData,
    })

    authStore.setSession({ token: previous })
    composable.openForm()
    await flushPromises()

    composable.save({
      name: 'Maria Silva',
      phone: '+351912345678',
      username: 'maria',
      gender: 'female',
      languages: '',
      emergencyContact: '',
      nif: '',
      address: '',
    })
    await flushPromises()

    expect(updateOwnEmployeeData).toHaveBeenCalledWith(
      expect.not.objectContaining({ email: expect.anything() }),
    )
    expect(authStore.token).toBe(reissued)
    expect(authStore.actor?.name).toBe('Maria Silva')
    expect(composable.isFormOpen.value).toBe(false)

    dispose()
  })
})
