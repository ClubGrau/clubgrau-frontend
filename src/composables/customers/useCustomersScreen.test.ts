import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
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
import type { GetLinkableIndicationOriginsApi } from '../../services/api/indications/types'
import type { Customer } from '../../types/customer'
import type { Indication } from '../../types/indication'
import { useCustomersScreen } from './useCustomersScreen'

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

function withScreen(
  api = stubApi(),
  linkableOrigins: GetLinkableIndicationOriginsApi = { getLinkableOrigins: vi.fn() },
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: false },
    },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
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
    linkableOrigins,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useCustomersScreen', () => {
  it('uses the injected adapter list as ListItem', async () => {
    const { composable, api, dispose } = withScreen()

    await vi.waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalled()
      expect(composable.filteredCustomers.value).toEqual([listItem()])
    })
    expect(composable.total.value).toBe(1)

    dispose()
  })

  it('opens and closes the create drawer', async () => {
    const { composable, dispose } = withScreen()

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })

    composable.openCreateDrawer()
    expect(composable.isCreateDrawerOpen.value).toBe(true)

    composable.closeCreateDrawer()
    expect(composable.isCreateDrawerOpen.value).toBe(false)

    dispose()
  })

  it('tracks the target name when opening the remove modal', async () => {
    const { composable, dispose } = withScreen()

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
    const { composable, dispose } = withScreen()

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

  it('opens a customer and ignores clicks that belong to the row actions', async () => {
    const { composable, api, dispose } = withScreen()

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
