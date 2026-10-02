import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { toApiError } from '../../domain/api-error'
import { ownEmployeeQueryKeys } from '../../services/api/employees/query-keys'
import type { GetOwnEmployeeApi } from '../../services/api/employees/types'
import type { Employee } from '../../types/employee'

export function useGetOwnEmployee(api: GetOwnEmployeeApi, enabled: Ref<boolean>) {
  const query = useQuery({
    queryKey: ownEmployeeQueryKeys.me,
    queryFn: () => api.getOwnEmployee(),
    enabled,
    retry: (failureCount, error) => {
      if (toApiError(error).code === 'UNAUTHORIZED') return false
      return failureCount < 1
    },
  })

  const employee = computed<Employee.ListItem | null>(() => query.data.value ?? null)

  return {
    employee,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    retry: () => {
      void query.refetch()
    },
  }
}
