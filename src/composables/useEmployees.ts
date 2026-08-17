import { computed, onUnmounted, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mapApiEmployeesToEmployees } from '../services/api/employees/map-employee'
import type {
  EmployeeApiStatus,
  GetEmployeesApi,
  GetEmployeesParams,
} from '../services/api/employees/types'
import type { EmployeeStatus } from '../types/employee'
import type { SelectFilterOption } from '../types/select-filter'

export type StatusFilter = 'todos' | EmployeeStatus

const EMPLOYEE_ROLE_OPTIONS: SelectFilterOption[] = [
  { id: 'all', label: 'Todos', value: '' },
  { id: 'EMPLOYEE', label: 'Colaborador', value: 'EMPLOYEE' },
  { id: 'MANAGER', label: 'Gerente', value: 'MANAGER' },
  { id: 'ADMIN', label: 'Administrador', value: 'ADMIN' },
]

function toApiStatus(filter: StatusFilter): EmployeeApiStatus | undefined {
  if (filter === 'todos') return undefined
  return filter
}

export function useEmployees(getEmployeesApi: GetEmployeesApi) {
  const pageSize = ref(10)
  const currentPage = ref(1)
  const statusFilter = ref<StatusFilter>('todos')
  const searchQuery = ref('')
  const debouncedSearch = ref('')
  const permissionFilter = ref('')

  let searchTimeout: ReturnType<typeof setTimeout> | undefined

  watch(searchQuery, (value) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      if (debouncedSearch.value === value) return
      debouncedSearch.value = value
      currentPage.value = 1
    }, 300)
  })

  onUnmounted(() => {
    clearTimeout(searchTimeout)
  })

  const listParams = computed<GetEmployeesParams>(() => {
    const params: GetEmployeesParams = {
      page: currentPage.value,
      limit: pageSize.value,
    }

    const status = toApiStatus(statusFilter.value)
    if (status) params.status = status

    if (permissionFilter.value) params.role = permissionFilter.value

    const search = debouncedSearch.value.trim()
    if (search) params.search = search

    return params
  })

  const query = useQuery({
    queryKey: ['employees', listParams],
    queryFn: () => getEmployeesApi.getEmployees(listParams.value),
  })

  const employees = computed(() =>
    mapApiEmployeesToEmployees(query.data.value?.data ?? []),
  )

  // Lista já vem filtrada/paginada do backend.
  const filteredEmployees = computed(() => employees.value)

  const total = computed(() => query.data.value?.total ?? 0)

  const resetToFirstPage = () => {
    currentPage.value = 1
  }

  const setStatusFilter = (value: StatusFilter) => {
    statusFilter.value = value
    resetToFirstPage()
  }

  const onPermissionFilterChange = () => {
    resetToFirstPage()
  }

  const permissionOptions = EMPLOYEE_ROLE_OPTIONS

  const stats = computed(() => {
    const ativos = employees.value.filter((e) => e.status === 'ACTIVE').length
    const ferias = employees.value.filter((e) => e.status === 'VACATION').length
    const inativos = employees.value.filter((e) => e.status === 'INACTIVE').length

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
