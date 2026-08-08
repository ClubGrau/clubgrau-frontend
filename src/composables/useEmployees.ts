import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mapApiEmployeesToEmployees } from '../services/api/employees/map-employee'
import type { GetEmployeesApi } from '../services/api/employees/types'
import type { EmployeeStatus } from '../types/employee'

export type StatusFilter = 'todos' | EmployeeStatus

export function useEmployees(getEmployeesApi: GetEmployeesApi) {
  const pageSize = ref(10)
  const currentPage = ref(1)
  const statusFilter = ref<StatusFilter>('todos')

  const query = useQuery({
    queryKey: ['employees', currentPage, pageSize],
    queryFn: () =>
      getEmployeesApi.getEmployees({
        page: currentPage.value,
        limit: pageSize.value,
      }),
  })

  const employees = computed(() =>
    mapApiEmployeesToEmployees(query.data.value?.data ?? []),
  )

  const total = computed(() => query.data.value?.total ?? 0)

  const setStatusFilter = (value: StatusFilter) => {
    statusFilter.value = value
    currentPage.value = 1
  }

  return {
    employees,
    pageSize,
    currentPage,
    statusFilter,
    setStatusFilter,
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
