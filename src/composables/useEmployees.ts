import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mapApiEmployeesToEmployees } from '../services/api/employees/map-employee'
import type { GetEmployeesApi } from '../services/api/employees/types'
import type { EmployeeStatus } from '../types/employee'
import type { SelectFilterOption } from '../types/select-filter'

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

  const resetToFirstPage = () => {
    currentPage.value = 1
  }

  const setStatusFilter = (value: StatusFilter) => {
    statusFilter.value = value
    resetToFirstPage()
  }

  const onSearchQueryChange = () => {
    resetToFirstPage()
  }

  const onPermissionFilterChange = () => {
    resetToFirstPage()
  }

  const permissionOptions = computed<SelectFilterOption[]>(() => [
    { id: 'all', label: 'Filtrar por permissão', value: '' },
    ...[...new Set(employees.value.map((employee) => employee.permission))].map(
      (permission) => ({
        id: permission,
        label: permission,
        value: permission,
      }),
    ),
  ])

  const stats = computed(() => {
    const ativos = employees.value.filter((e) => e.status === 'ativo').length
    const ferias = employees.value.filter((e) => e.status === 'ferias').length
    const inativos = employees.value.filter((e) => e.status === 'inativo').length

    return { total: total.value, ativos, ferias, inativos }
  })

  return {
    employees,
    filteredEmployees,
    pageSize,
    currentPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    onSearchQueryChange,
    permissionFilter,
    onPermissionFilterChange,
    permissionOptions,
    stats,
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
