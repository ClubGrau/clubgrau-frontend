import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { Customer } from '../../types/customer'
import { useCustomersScreen } from './useCustomersScreen'

function listItem(overrides: Partial<Customer.ListItem> = {}): Customer.ListItem {
  return {
    id: 'cust-1',
    name: 'Marina Albuquerque',
    email: 'marina@nordeng.com.br',
    phone: '(85) 98812-4410',
    nif: '251847963',
    referral: 'Rafael Nunes',
    rank: 'OURO',
    createdAt: '2026-01-14T00:00:00.000Z',
    initials: 'MA',
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
  }
}

function withScreen(api = stubApi()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: false },
    },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() => scope.run(() => useCustomersScreen(api)))
  if (!composable) {
    throw new Error('useCustomersScreen did not return inside the Vue context')
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
})
