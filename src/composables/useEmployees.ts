import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mapApiEmployeesToEmployees } from '../services/api/employees/map-employee'
import type { GetEmployeesApi } from '../services/api/employees/types'

export function useEmployees(
  getEmployeesApi: GetEmployeesApi,
  page: Ref<number>,
  limit: Ref<number>,
) {
  const query = useQuery({
    queryKey: ['employees', page, limit],
    queryFn: () =>
      getEmployeesApi.getEmployees({
        page: page.value,
        limit: limit.value,
      }),
  })

  const employees = computed(() =>
    mapApiEmployeesToEmployees(query.data.value?.data ?? []),
  )

  const total = computed(() => query.data.value?.total ?? 0)

  return {
    employees,
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
