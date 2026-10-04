import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { revenueForMonth } from '../../domain/dashboard'
import { emptyCustomerWalletSummary } from '../../domain/customer-wallet'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type { GetCustomersApi } from '../../services/api/customers/types'
import { dashboardQueryKeys } from '../../services/api/dashboard/query-keys'
import type { GetDashboardOperationsApi } from '../../services/api/dashboard/types'
import type { Customer } from '../../types/customer'

const recentCustomersParams = {
  page: 1,
  limit: 3,
  sort: 'createdAt' as const,
  direction: 'desc' as const,
}

export function useDashboard(
  getCustomersApi: GetCustomersApi,
  getOperationsApi: GetDashboardOperationsApi,
) {
  const walletQuery = useQuery({
    queryKey: customerQueryKeys.list(recentCustomersParams),
    queryFn: () => getCustomersApi.getCustomers(recentCustomersParams),
  })

  const operationsQuery = useQuery({
    queryKey: dashboardQueryKeys.operations(),
    queryFn: () => getOperationsApi.getOperations(),
  })

  const summary = computed(
    () => walletQuery.data.value?.summary ?? emptyCustomerWalletSummary(),
  )

  const recentCustomers = computed<Customer.ListItem[]>(
    () => walletQuery.data.value?.data ?? [],
  )

  const operations = computed(() => operationsQuery.data.value ?? null)

  const revenueThisMonth = computed(() => {
    const months = operations.value?.revenueByMonth ?? []
    return revenueForMonth(months, new Date().getMonth() + 1)
  })

  return {
    summary,
    recentCustomers,
    operations,
    revenueThisMonth,
    currentMonth: computed(() => new Date().getMonth() + 1),
    isWalletLoading: walletQuery.isPending,
    isOperationsLoading: operationsQuery.isPending,
  }
}
