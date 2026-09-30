import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick } from 'vue'
import type { GetEmployeesApi, GetEmployeesParams } from '../services/api/employees/types'
import type { Pagination } from '../types/pagination'
import type { Employee, EmployeeStatus } from '../types/employee'
import { useEmployees } from './useEmployees'

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

function page(
  partial: Partial<Pagination.PaginationResponse<Employee.ListItem>> = {},
): Pagination.PaginationResponse<Employee.ListItem> {
  return {
    data: partial.data ?? [],
    page: partial.page ?? 1,
    limit: partial.limit ?? 10,
    total: partial.total ?? 0,
    totalPages: partial.totalPages ?? 1,
  }
}

const STATUS_TOTALS: Record<EmployeeStatus, number> = {
  ACTIVE: 6,
  VACATION: 2,
  INACTIVE: 4,
}

function withEmployees(getEmployees: GetEmployeesApi['getEmployees']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() => scope.run(() => useEmployees({ getEmployees })))
  if (!composable) {
    throw new Error('useEmployees did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useEmployees stats', () => {
  it('counts each status from the API total, not the rows on the current page', async () => {
    const getEmployees = vi.fn(async (params: GetEmployeesParams) => {
      if (params.status) {
        return page({
          limit: params.limit,
          total: STATUS_TOTALS[params.status],
          totalPages: STATUS_TOTALS[params.status],
        })
      }

      return page({
        data: [
          listItem({ id: '1', status: 'ACTIVE' }),
          listItem({ id: '2', status: 'ACTIVE' }),
          listItem({ id: '3', status: 'VACATION' }),
          listItem({ id: '4', status: 'INACTIVE' }),
          listItem({ id: '5', status: 'INACTIVE' }),
        ],
        limit: params.limit,
        total: 12,
        totalPages: 3,
      })
    })

    const { composable, dispose } = withEmployees(getEmployees)
    composable.pageSize.value = 5

    await vi.waitFor(() => {
      expect(composable.stats.value).toEqual({
        total: 12,
        ativos: 6,
        ferias: 2,
        inativos: 4,
      })
    })

    expect(composable.filteredEmployees.value).toHaveLength(5)
    expect(composable.total.value).toBe(12)
    expect(getEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE', page: 1, limit: 1 }),
    )

    const activeCallsBefore = getEmployees.mock.calls.filter(
      ([params]) => params.status === 'ACTIVE',
    ).length

    composable.currentPage.value = 2
    composable.setStatusFilter('INACTIVE')
    await nextTick()

    expect(composable.stats.value).toEqual({
      total: 12,
      ativos: 6,
      ferias: 2,
      inativos: 4,
    })
    expect(
      getEmployees.mock.calls.filter(([params]) => params.status === 'ACTIVE').length,
    ).toBe(activeCallsBefore)

    dispose()
  })

  it('keeps the previous rows while the next list request is in flight', async () => {
    let resolvePageTwo: ((value: Pagination.PaginationResponse<Employee.ListItem>) => void) | undefined

    const getEmployees = vi.fn(async (params: GetEmployeesParams) => {
      if (params.status) {
        return page({
          limit: params.limit,
          total: STATUS_TOTALS[params.status],
          totalPages: STATUS_TOTALS[params.status],
        })
      }

      if (params.page === 2) {
        return new Promise<Pagination.PaginationResponse<Employee.ListItem>>((resolve) => {
          resolvePageTwo = resolve
        })
      }

      return page({
        data: [listItem({ id: '1' }), listItem({ id: '2' })],
        page: 1,
        total: 2,
      })
    })

    const { composable, dispose } = withEmployees(getEmployees)

    await vi.waitFor(() => {
      expect(composable.filteredEmployees.value.map((employee) => employee.id)).toEqual(['1', '2'])
    })

    composable.currentPage.value = 2

    await vi.waitFor(() => {
      expect(composable.isFetching.value).toBe(true)
    })

    expect(composable.isLoading.value).toBe(false)
    expect(composable.filteredEmployees.value.map((employee) => employee.id)).toEqual(['1', '2'])

    resolvePageTwo?.(
      page({
        data: [listItem({ id: '3' })],
        page: 2,
        total: 2,
      }),
    )

    await vi.waitFor(() => {
      expect(composable.filteredEmployees.value.map((employee) => employee.id)).toEqual(['3'])
    })

    dispose()
  })
})
