import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { emptyCustomerWalletSummary } from '../../domain/customer-wallet'
import { readWalletSummary } from '../customers/useCustomers'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type { GetCustomersApi } from '../../services/api/customers/types'
import { employeeQueryKeys } from '../../services/api/employees/query-keys'
import type { EmployeeApiStatus, GetEmployeesApi } from '../../services/api/employees/types'
import { indicationQueryKeys } from '../../services/api/indications/query-keys'
import type { GetIndicationCatalogApi } from '../../services/api/indications/types'
import type { Customer } from '../../types/customer'
import type { IndicationOriginCategoryId } from '../../types/indication'

const recentCustomersParams = {
  page: 1,
  limit: 5,
  sort: 'createdAt' as const,
  direction: 'desc' as const,
}

export interface DashboardFloorPorts {
  getEmployeesApi: GetEmployeesApi
  getCatalogApi: GetIndicationCatalogApi
  enabled: MaybeRefOrGetter<boolean>
}

function activeOrigins(
  categories: { id: string; origins: { active: boolean }[] }[] | undefined,
  id: IndicationOriginCategoryId,
) {
  return (
    categories
      ?.find((category) => category.id === id)
      ?.origins.filter((origin) => origin.active).length ?? 0
  )
}

export function useDashboard(getCustomersApi: GetCustomersApi, floor: DashboardFloorPorts) {
  const includeFloor = computed(() => toValue(floor.enabled))

  const walletQuery = useQuery({
    queryKey: customerQueryKeys.wallet(),
    queryFn: () => readWalletSummary(getCustomersApi),
  })

  const recentQuery = useQuery({
    queryKey: customerQueryKeys.list(recentCustomersParams),
    queryFn: () => getCustomersApi.getCustomers(recentCustomersParams),
  })

  const statusCount = (status: EmployeeApiStatus) => {
    const params = { page: 1, limit: 1, status }
    return useQuery({
      queryKey: employeeQueryKeys.list(params),
      queryFn: () => floor.getEmployeesApi.getEmployees(params),
      select: (response) => response.total,
      enabled: includeFloor,
    })
  }

  const activeCount = statusCount('ACTIVE')
  const vacationCount = statusCount('VACATION')
  const inactiveCount = statusCount('INACTIVE')

  const catalogQuery = useQuery({
    queryKey: indicationQueryKeys.catalog,
    queryFn: () => floor.getCatalogApi.getCatalog(),
    enabled: includeFloor,
  })

  const summary = computed(() => walletQuery.data.value ?? emptyCustomerWalletSummary())

  const team = computed(() => ({
    active: activeCount.data.value ?? 0,
    vacation: vacationCount.data.value ?? 0,
    inactive: inactiveCount.data.value ?? 0,
  }))

  const origins = computed(() => {
    const categories = catalogQuery.data.value?.categories
    return {
      canal: activeOrigins(categories, 'canal'),
      campanha: activeOrigins(categories, 'campanha'),
    }
  })

  const recentCustomers = computed<Customer.ListItem[]>(
    () => recentQuery.data.value?.data ?? [],
  )

  const isWalletLoading = walletQuery.isPending
  const isWalletError = walletQuery.isError
  const isRecentLoading = recentQuery.isPending
  const isRecentError = recentQuery.isError
  const isCatalogLoading = catalogQuery.isLoading
  const isCatalogError = catalogQuery.isError

  const isTeamLoading = computed(
    () =>
      activeCount.isLoading.value ||
      vacationCount.isLoading.value ||
      inactiveCount.isLoading.value,
  )

  const isTeamError = computed(
    () => activeCount.isError.value || vacationCount.isError.value || inactiveCount.isError.value,
  )

  return {
    summary,
    recentCustomers,
    includeFloor,
    team,
    origins,
    isWalletLoading,
    isWalletError,
    isRecentLoading,
    isRecentError,
    isTeamLoading,
    isCatalogLoading,
    isTeamError,
    isCatalogError,
  }
}
