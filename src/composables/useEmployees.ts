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
  const searchQuery = ref('')
  const permissionFilter = ref('')

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

  const filteredEmployees = computed(() =>
    employees.value.filter((employee) => {
      const matchesStatus =
        statusFilter.value === 'todos' || employee.status === statusFilter.value

      const queryText = searchQuery.value.trim().toLowerCase()
      const matchesSearch =
        !queryText ||
        employee.name.toLowerCase().includes(queryText) ||
        employee.username.toLowerCase().includes(queryText) ||
        employee.email.toLowerCase().includes(queryText) ||
        employee.phone.toLowerCase().includes(queryText) ||
        employee.nif.includes(queryText)

      const matchesPermission =
        !permissionFilter.value ||
        employee.permission === permissionFilter.value

      return matchesStatus && matchesSearch && matchesPermission
    }),
  )

  const setStatusFilter = (value: StatusFilter) => {
    statusFilter.value = value
    currentPage.value = 1
  }

  const onPermissionFilterChange = () => {
    currentPage.value = 1
  }

  return {
    employees,
    filteredEmployees,
    pageSize,
    currentPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    permissionFilter,
    onPermissionFilterChange,
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
