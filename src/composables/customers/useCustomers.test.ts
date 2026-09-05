import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { Customer } from '../../types/customer'
import type { GetCustomersApi } from '../../services/api/customers/types'
import { useCustomers } from './useCustomers'

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

function stubApi(item = listItem()): GetCustomersApi {
  return {
    getCustomers: vi.fn().mockResolvedValue({
      data: [item],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    }),
  }
}

function withCustomers(api: GetCustomersApi = stubApi()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: false },
    },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() => scope.run(() => useCustomers(api)))
  if (!composable) {
    throw new Error('useCustomers did not return inside the Vue context')
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

describe('useCustomers', () => {
  it('exposes the injected list as ListItem', async () => {
    const { composable, api, dispose } = withCustomers()

    await vi.waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalled()
      expect(composable.filteredCustomers.value).toEqual([listItem()])
    })
    expect(composable.total.value).toBe(1)

    dispose()
  })

  it('toggles the rank filter and resets to the first page', async () => {
    const { composable, dispose } = withCustomers()

    await vi.waitFor(() => {
      expect(composable.filteredCustomers.value).toHaveLength(1)
    })

    composable.currentPage.value = 2
    composable.toggleRankFilter('OURO')
    expect(composable.rankFilter.value).toBe('OURO')
    expect(composable.currentPage.value).toBe(1)

    composable.toggleRankFilter('OURO')
    expect(composable.rankFilter.value).toBeNull()

    composable.toggleRankFilter('PRATA')
    expect(composable.rankFilter.value).toBe('PRATA')
    composable.toggleRankFilter('OURO')
    expect(composable.rankFilter.value).toBe('OURO')

    dispose()
  })
})
