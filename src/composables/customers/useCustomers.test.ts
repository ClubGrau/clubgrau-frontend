import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { calendarMonthKey } from '../../domain/customer-wallet'
import type { Customer } from '../../types/customer'
import type { GetCustomersApi, GetCustomersParams } from '../../services/api/customers/types'
import { readWalletSummary, useCustomers } from './useCustomers'

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
    composable.toggleRankFilter('GOLD')
    expect(composable.rankFilter.value).toBe('GOLD')
    expect(composable.currentPage.value).toBe(1)

    composable.toggleRankFilter('GOLD')
    expect(composable.rankFilter.value).toBeNull()

    composable.toggleRankFilter('SILVER')
    expect(composable.rankFilter.value).toBe('SILVER')
    composable.toggleRankFilter('GOLD')
    expect(composable.rankFilter.value).toBe('GOLD')

    dispose()
  })

  it('sorts by newest registration and toggles the active column', async () => {
    const { composable, api, dispose } = withCustomers()

    await vi.waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'createdAt', direction: 'desc' }),
      )
    })

    composable.toggleSort('name')
    await vi.waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'name', direction: 'asc', page: 1 }),
      )
    })

    composable.toggleSort('name')
    await vi.waitFor(() => {
      expect(api.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'name', direction: 'desc' }),
      )
    })

    composable.currentPage.value = 3
    composable.toggleSort('rank')
    expect(composable.sortKey.value).toBe('rank')
    expect(composable.sortDirection.value).toBe('asc')
    expect(composable.currentPage.value).toBe(1)

    dispose()
  })

  it('counts newcomers this month when the list has no wallet summary', async () => {
    const month = calendarMonthKey(new Date())
    const api: GetCustomersApi = {
      getCustomers: vi.fn().mockImplementation(async (params: GetCustomersParams) => {
        if (params.limit === 100) {
          return {
            data: [listItem({ id: 'new', createdAt: `${month}-04T12:00:00.000Z` })],
            page: 1,
            limit: 100,
            total: 4,
            totalPages: 1,
          }
        }

        return {
          data: [listItem()],
          page: 1,
          limit: params.limit,
          total: 4,
          totalPages: 1,
        }
      }),
    }
    const { composable, dispose } = withCustomers(api)

    await vi.waitFor(() => {
      expect(composable.hasJoinedThisMonth.value).toBe(true)
    })
    expect(composable.joinedThisMonth.value).toBe(1)
    expect(composable.walletTotal.value).toBe(4)
    expect(composable.isStatsLoading.value).toBe(false)

    dispose()
  })

  it('keeps the wallet cards loading until the summary walk finishes', async () => {
    let releaseWallet: () => void = () => {}
    const walletGate = new Promise<void>((resolve) => {
      releaseWallet = resolve
    })
    const api: GetCustomersApi = {
      getCustomers: vi.fn().mockImplementation(async (params: GetCustomersParams) => {
        if (params.limit === 100) {
          await walletGate
          return {
            data: [listItem()],
            page: 1,
            limit: 100,
            total: 4,
            totalPages: 1,
          }
        }

        return {
          data: [listItem()],
          page: 1,
          limit: params.limit,
          total: 4,
          totalPages: 1,
        }
      }),
    }
    const { composable, dispose } = withCustomers(api)

    await vi.waitFor(() => {
      expect(composable.isLoading.value).toBe(false)
      expect(composable.isStatsLoading.value).toBe(true)
    })
    expect(composable.hasJoinedThisMonth.value).toBe(false)

    releaseWallet()

    await vi.waitFor(() => {
      expect(composable.hasJoinedThisMonth.value).toBe(true)
    })
    expect(composable.isStatsLoading.value).toBe(false)

    dispose()
  })
})

describe('readWalletSummary', () => {
  it('walks every page so older customers still count toward rank and indication', async () => {
    const month = calendarMonthKey(new Date())
    const api: GetCustomersApi = {
      getCustomers: vi.fn().mockImplementation(async (params: GetCustomersParams) => {
        if (params.page === 1) {
          return {
            data: [
              listItem({
                id: 'new-1',
                createdAt: `${month}-02T12:00:00.000Z`,
                rank: 'BRONZE',
                indicationCategoryId: 'canal',
              }),
              listItem({
                id: 'new-2',
                createdAt: `${month}-03T12:00:00.000Z`,
                rank: 'BRONZE',
                indicationCategoryId: null,
              }),
            ],
            page: 1,
            limit: 100,
            total: 3,
            totalPages: 2,
          }
        }

        return {
          data: [
            listItem({
              id: 'old',
              createdAt: '2020-01-01T00:00:00.000Z',
              rank: 'GOLD',
              indicationCategoryId: 'amigo',
            }),
          ],
          page: 2,
          limit: 100,
          total: 3,
          totalPages: 2,
        }
      }),
    }

    await expect(readWalletSummary(api)).resolves.toMatchObject({
      total: 3,
      joinedThisMonth: 2,
      byRank: { GOLD: 1, SILVER: 0, BRONZE: 2 },
      byIndication: { canal: 1, campanha: 0, amigo: 1, none: 1 },
    })
    expect(api.getCustomers).toHaveBeenCalledTimes(2)
  })

  it('uses the wallet summary when the source already counted it', async () => {
    const summary = {
      total: 8,
      joinedThisMonth: 3,
      joinedLastMonth: 1,
      byRank: { GOLD: 1, SILVER: 1, BRONZE: 6 },
      byIndication: { canal: 2, campanha: 1, amigo: 3, none: 2 },
    }
    const api: GetCustomersApi = {
      getCustomers: vi.fn().mockResolvedValue({
        data: [],
        page: 1,
        limit: 100,
        total: 8,
        totalPages: 1,
        summary,
      }),
    }

    await expect(readWalletSummary(api)).resolves.toEqual(summary)
    expect(api.getCustomers).toHaveBeenCalledTimes(1)
  })
})
