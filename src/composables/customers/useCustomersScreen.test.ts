import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'

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
import type {
  CreateCustomerApi,
  GetCustomerApi,
  GetCustomersApi,
  RemoveCustomerApi,
} from '../../services/api/customers/types'
import type { GetLinkableIndicationOriginsApi } from '../../services/api/indications/types'
import { useAuthStore } from '../../stores/auth'
import type { ActorRole } from '../../types/actor'
import type { Customer } from '../../types/customer'
import type { Indication } from '../../types/indication'
import { useToast } from '../useToast'
import { useCustomersScreen } from './useCustomersScreen'

type ScreenApi = GetCustomersApi &
  Partial<GetCustomerApi & RemoveCustomerApi> &
  CreateCustomerApi

const { toasts, dismiss } = useToast()

function dismissAllToasts() {
  for (const toast of [...toasts.value]) {
    dismiss(toast.id)
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

function listItem(overrides: Partial<Customer.ListItem> = {}): Customer.ListItem {
  return {
    id: 'cust-1',
    name: 'Marina Albuquerque',
    email: 'marina@nordeng.com.br',
    phone: '(85) 98812-4410',
    nif: '251847963',
    referral: 'Rafael Nunes',
    rank: 'GOLD',
    createdAt: '2026-01-14T00:00:00.000Z',
    initials: 'MA',
    referralCustomerId: 'cust-2',
    referredCount: 1,
    ...overrides,
  }
}

function stubApi(item = listItem()) {
  return {
    getCustomers: vi.fn().mockResolvedValue({
      data: [item],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    }),
    create: vi.fn().mockResolvedValue({ id: 'cust-new' }),
    remove: vi.fn().mockResolvedValue({ id: item.id }),
    getCustomer: vi.fn().mockResolvedValue(item),
  }
}

function withScreen<T extends ScreenApi>(
  api: T,
  linkableOrigins: GetLinkableIndicationOriginsApi = { getLinkableOrigins: vi.fn() },
  role: ActorRole | null = 'ADMIN',
) {
  localStorage.clear()
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: false },
    },
  })
  const pinia = createPinia()
  setActivePinia(pinia)
  const app = createApp({})
  app.use(pinia)
  app.use(VueQueryPlugin, { queryClient })
  const authStore = app.runWithContext(() => useAuthStore())
  if (role) {
    authStore.setSession({
      token: jwt({
        id: 'actor-1',
        name: 'Operador',
        email: 'op@grau.pt',
        role,
        status: 'ACTIVE',
      }),
    })
  }
  const scope = effectScope()
  const composable = app.runWithContext(() =>
    scope.run(() => useCustomersScreen(api, api, linkableOrigins)),
  )
  if (!composable) {
    throw new Error('useCustomersScreen did not return inside the Vue context')
  }
  return {
    composable,
    api,
    authStore,
    linkableOrigins,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useCustomersScreen', () => {
  afterEach(dismissAllToasts)

  it('uses the injected adapter list as ListItem', async () => {
    const { composable, api, dispose } = withScreen(stubApi())

    await vi.waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalled()
      expect(composable.filteredCustomers.value).toEqual([listItem()])
    })
    expect(composable.total.value).toBe(1)

    dispose()
  })

  it('opens and closes the create drawer', async () => {
    const { composable, dispose } = withScreen(stubApi())

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })

    composable.openCreateDrawer()
    expect(composable.isCreateDrawerOpen.value).toBe(true)

    composable.closeCreateDrawer()
    expect(composable.isCreateDrawerOpen.value).toBe(false)

    dispose()
  })

  it('offers remove to ADMIN and MANAGER and hides it from EMPLOYEE and unauthenticated sessions', () => {
    const admin = withScreen(stubApi(), undefined, 'ADMIN')
    expect(admin.composable.canRemove.value).toBe(true)
    admin.dispose()

    const manager = withScreen(stubApi(), undefined, 'MANAGER')
    expect(manager.composable.canRemove.value).toBe(true)
    manager.dispose()

    const employee = withScreen(stubApi(), undefined, 'EMPLOYEE')
    expect(employee.composable.canRemove.value).toBe(false)
    employee.composable.openRemoveModal('cust-1')
    expect(employee.composable.isRemoveModalOpen.value).toBe(false)
    employee.dispose()

    const anonymous = withScreen(stubApi(), undefined, null)
    expect(anonymous.composable.canRemove.value).toBe(false)
    anonymous.dispose()
  })

  it('tracks the target name when opening the remove modal', async () => {
    const { composable, dispose } = withScreen(stubApi())

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })

    composable.openRemoveModal('cust-1')
    expect(composable.isRemoveModalOpen.value).toBe(true)
    expect(composable.removeCustomerName.value).toBe('Marina Albuquerque')

    composable.closeRemoveModal()
    expect(composable.isRemoveModalOpen.value).toBe(false)
    expect(composable.activeCustomerId.value).toBeNull()

    dispose()
  })

  it('opens the remove modal from the overflow menu action', async () => {
    const { composable, dispose } = withScreen(stubApi(), undefined, 'MANAGER')

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })

    composable.openActionsId.value = 'cust-1'
    composable.onRemoveAction('cust-1')

    expect(composable.openActionsId.value).toBeNull()
    expect(composable.isRemoveModalOpen.value).toBe(true)
    expect(composable.removeCustomerName.value).toBe('Marina Albuquerque')

    dispose()
  })

  it('submits remove with the actor password and closes both modal and detail drawer on 200', async () => {
    const { composable, api, dispose } = withScreen(stubApi(), undefined, 'MANAGER')

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })

    composable.openCustomer('cust-1')
    await vi.waitFor(() => {
      expect(composable.detailCustomerId.value).toBe('cust-1')
    })

    composable.openRemoveModal('cust-1')
    composable.handleRemoveCustomer('manager-password')

    await vi.waitFor(() => {
      expect(api.remove).toHaveBeenCalledWith({
        id: 'cust-1',
        password: 'manager-password',
      })
      expect(composable.isRemoveModalOpen.value).toBe(false)
      expect(composable.detailCustomerId.value).toBeNull()
    })

    dispose()
  })

  it('keeps the remove modal and detail drawer open when password confirmation fails (401)', async () => {
    const api = stubApi()
    api.remove.mockRejectedValue({
      response: { status: 401, data: { error: 'Authentication failed' } },
    })
    const { composable, dispose } = withScreen(api, undefined, 'ADMIN')

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })

    composable.openCustomer('cust-1')
    composable.openRemoveModal('cust-1')
    composable.handleRemoveCustomer('wrong-password')

    await vi.waitFor(() => {
      expect(composable.removeError.value).toBe(
        'Não foi possível confirmar a sua identidade. Verifique a palavra-passe.',
      )
    })
    expect(composable.isRemoveModalOpen.value).toBe(true)
    expect(composable.detailCustomerId.value).toBe('cust-1')

    dispose()
  })

  it('opens a customer and ignores clicks that belong to the row actions', async () => {
    const { composable, api, dispose } = withScreen(stubApi())

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })

    const actionEvent = {
      target: { closest: () => ({}) },
    } as unknown as MouseEvent
    composable.onCustomerRowClick(actionEvent, 'cust-1')
    expect(api.getCustomer).not.toHaveBeenCalled()

    composable.openCustomer('cust-1')
    await vi.waitFor(() => {
      expect(api.getCustomer).toHaveBeenCalledWith('cust-1')
      expect(composable.detailCustomer.value?.name).toBe('Marina Albuquerque')
    })

    composable.closeCustomer()
    expect(composable.detailCustomerId.value).toBeNull()
    expect(composable.detailCustomer.value).toBeNull()

    dispose()
  })

  it('opens a customer from the current page when there is no get-by-id port', async () => {
    const api = {
      getCustomers: vi.fn().mockResolvedValue({
        data: [listItem()],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      }),
      create: vi.fn().mockResolvedValue({ id: 'cust-new' }),
    }
    const { composable, dispose } = withScreen(api)

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })

    composable.openCustomer('cust-1')
    await vi.waitFor(() => {
      expect(composable.detailCustomer.value?.name).toBe('Marina Albuquerque')
    })
    expect(composable.canRemove.value).toBe(false)

    composable.openCustomer('missing')
    await vi.waitFor(() => {
      expect(composable.detailCustomer.value).toBeNull()
    })
    expect(composable.detailCustomerId.value).toBe('missing')

    dispose()
  })

  it('reads linkable origins only after Canal or Campanha is selected', async () => {
    const origins: Indication.LinkableOrigin[] = [
      { id: 'canal-active', categoryId: 'canal', name: 'Facebook' },
    ]
    const linkableOrigins: GetLinkableIndicationOriginsApi = {
      getLinkableOrigins: vi.fn().mockResolvedValue(origins),
    }
    const { composable, dispose } = withScreen(stubApi(), linkableOrigins)

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })
    expect(linkableOrigins.getLinkableOrigins).not.toHaveBeenCalled()

    composable.setCustomerWasReferred(true)
    composable.setCustomerIndicationCategory('amigo')
    expect(linkableOrigins.getLinkableOrigins).not.toHaveBeenCalled()
    expect(composable.indicationOrigins.value).toEqual([])

    composable.setCustomerIndicationCategory('canal')
    await vi.waitFor(() => {
      expect(linkableOrigins.getLinkableOrigins).toHaveBeenCalledTimes(1)
      expect(composable.indicationOrigins.value.map((origin) => origin.id)).toEqual([
        'canal-active',
      ])
    })

    composable.setCustomerIndicationCategory('campanha')
    expect(composable.indicationOrigins.value).toEqual([])
    expect(linkableOrigins.getLinkableOrigins).toHaveBeenCalledTimes(1)

    composable.closeCreateDrawer()
    expect(linkableOrigins.getLinkableOrigins).toHaveBeenCalledTimes(1)

    dispose()
  })
})
