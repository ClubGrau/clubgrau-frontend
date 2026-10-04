import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { GetCustomersApi } from '../../services/api/customers/types'
import { dashboardOperationsSnapshot } from '../../services/api/dashboard/hardcoded-dashboard-api'
import type { GetDashboardOperationsApi } from '../../services/api/dashboard/types'
import type { Customer } from '../../types/customer'
import { useDashboard } from './useDashboard'

function listItem(overrides: Partial<Customer.ListItem> = {}): Customer.ListItem {
  return {
    id: 'cust-8',
    name: 'Pedro Santos',
    email: 'pedro@example.com',
    phone: '(11) 99640-2233',
    nif: '183920456',
    referral: '',
    rank: 'PRATA',
    createdAt: '2026-10-02T00:00:00.000Z',
    initials: 'PS',
    referralCustomerId: null,
    referredCount: 0,
    ...overrides,
  }
}

function withDashboard() {
  const customersApi: GetCustomersApi = {
    getCustomers: vi.fn().mockResolvedValue({
      data: [listItem()],
      page: 1,
      limit: 3,
      total: 8,
      totalPages: 3,
      summary: {
        total: 8,
        joinedThisMonth: 2,
        byRank: { OURO: 2, PRATA: 5, BRONZE: 1 },
      },
    }),
  }
  const operationsApi: GetDashboardOperationsApi = {
    getOperations: vi.fn().mockResolvedValue(dashboardOperationsSnapshot()),
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() =>
    scope.run(() => useDashboard(customersApi, operationsApi)),
  )
  if (!composable) throw new Error('useDashboard did not return inside the Vue context')

  return {
    composable,
    customersApi,
    operationsApi,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useDashboard', () => {
  it('loads the wallet summary, the latest customers and the operations snapshot', async () => {
    const { composable, customersApi, operationsApi, dispose } = withDashboard()

    await vi.waitFor(() => {
      expect(customersApi.getCustomers).toHaveBeenCalledWith({
        page: 1,
        limit: 3,
        sort: 'createdAt',
        direction: 'desc',
      })
      expect(operationsApi.getOperations).toHaveBeenCalled()
      expect(composable.summary.value.total).toBe(8)
      expect(composable.recentCustomers.value[0]?.name).toBe('Pedro Santos')
      expect(composable.operations.value?.appointmentsToday).toBe(5)
    })

    dispose()
  })
})
