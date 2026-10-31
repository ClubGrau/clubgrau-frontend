import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, ref } from 'vue'
import type { CustomerWalletSummary } from '../../domain/customer-wallet'
import type { GetCustomersApi } from '../../services/api/customers/types'
import type { GetEmployeesApi } from '../../services/api/employees/types'
import type { GetIndicationCatalogApi } from '../../services/api/indications/types'
import type { Customer } from '../../types/customer'
import type { Indication } from '../../types/indication'
import { useDashboard } from './useDashboard'

const walletSummary: CustomerWalletSummary = {
  total: 8,
  joinedThisMonth: 2,
  joinedLastMonth: 1,
  byRank: { GOLD: 2, SILVER: 5, BRONZE: 1 },
  byIndication: { canal: 3, campanha: 1, amigo: 2, none: 2 },
}

function listItem(overrides: Partial<Customer.ListItem> = {}): Customer.ListItem {
  return {
    id: 'cust-8',
    name: 'Pedro Santos',
    email: 'pedro@example.com',
    phone: '(11) 99640-2233',
    nif: '183920456',
    referral: '',
    rank: 'SILVER',
    createdAt: '2026-10-02T00:00:00.000Z',
    initials: 'PS',
    referralCustomerId: null,
    referredCount: 0,
    ...overrides,
  }
}

function catalog(): Indication.Catalog {
  return {
    categories: [
      {
        id: 'canal',
        name: 'Canal',
        holdsOrigins: true,
        origins: [
          { id: 'c1', categoryId: 'canal', name: 'Instagram', active: true },
          { id: 'c2', categoryId: 'canal', name: 'Antigo', active: false },
        ],
      },
      {
        id: 'campanha',
        name: 'Campanha',
        holdsOrigins: true,
        origins: [{ id: 'p1', categoryId: 'campanha', name: 'Verão', active: true }],
      },
      {
        id: 'amigo',
        name: 'Amigo',
        holdsOrigins: false,
        origins: [],
      },
    ],
  }
}

function withDashboard(includeFloor = false) {
  const customersApi: GetCustomersApi = {
    getCustomers: vi.fn().mockImplementation(async (params) => {
      if (params.limit === 5) {
        return {
          data: [listItem()],
          page: 1,
          limit: 5,
          total: 8,
          totalPages: 2,
        }
      }

      return {
        data: [],
        page: 1,
        limit: 100,
        total: 8,
        totalPages: 1,
        summary: walletSummary,
      }
    }),
  }
  const employeesApi: GetEmployeesApi = {
    getEmployees: vi.fn().mockImplementation(async (params) => ({
      data: [],
      page: 1,
      limit: 1,
      total: params.status === 'ACTIVE' ? 4 : params.status === 'VACATION' ? 1 : 2,
      totalPages: 1,
    })),
  }
  const catalogApi: GetIndicationCatalogApi = {
    getCatalog: vi.fn().mockResolvedValue(catalog()),
  }
  const enabled = ref(includeFloor)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() =>
    scope.run(() =>
      useDashboard(customersApi, {
        getEmployeesApi: employeesApi,
        getCatalogApi: catalogApi,
        enabled,
      }),
    ),
  )
  if (!composable) throw new Error('useDashboard did not return inside the Vue context')

  return {
    composable,
    customersApi,
    employeesApi,
    catalogApi,
    enabled,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useDashboard', () => {
  it('loads the wallet summary and the latest customers', async () => {
    const { composable, customersApi, employeesApi, catalogApi, dispose } = withDashboard()

    await vi.waitFor(() => {
      expect(customersApi.getCustomers).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
      })
      expect(customersApi.getCustomers).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
        sort: 'createdAt',
        direction: 'desc',
      })
      expect(composable.summary.value).toEqual(walletSummary)
      expect(composable.recentCustomers.value[0]?.name).toBe('Pedro Santos')
      expect(composable.includeFloor.value).toBe(false)
    })

    expect(employeesApi.getEmployees).not.toHaveBeenCalled()
    expect(catalogApi.getCatalog).not.toHaveBeenCalled()

    dispose()
  })

  it('loads the team and the active catalog origins when the floor is visible', async () => {
    const { composable, employeesApi, catalogApi, dispose } = withDashboard(true)

    await vi.waitFor(() => {
      expect(employeesApi.getEmployees).toHaveBeenCalledWith({
        page: 1,
        limit: 1,
        status: 'ACTIVE',
      })
      expect(catalogApi.getCatalog).toHaveBeenCalled()
      expect(composable.team.value).toEqual({ active: 4, vacation: 1, inactive: 2 })
      expect(composable.origins.value).toEqual({ canal: 1, campanha: 1 })
    })

    dispose()
  })
})
