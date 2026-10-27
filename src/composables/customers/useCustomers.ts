import { computed, onUnmounted, ref, watch } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type {
  GetCustomersApi,
  GetCustomersParams,
} from '../../services/api/customers/types'
import { emptyCustomerWalletSummary, summarizeCustomers } from '../../domain/customer-wallet'
import type {
  Customer,
  CustomerRank,
  CustomerSortDirection,
  CustomerSortKey,
} from '../../types/customer'

/** Matches the API page cap so one read can see a whole month of newcomers. */
const WALLET_MONTH_PAGE_LIMIT = 100

/**
 * Counts customers registered in the current calendar month.
 * GET /api/customers is newest-first and has no wallet summary, so this walks
 * pages until an older registration appears. A source that already returns
 * `summary` is used as-is.
 */
export async function readJoinedThisMonth(
  getCustomersApi: GetCustomersApi,
  now = new Date(),
): Promise<{ total: number; joinedThisMonth: number }> {
  let page = 1
  let joinedThisMonth = 0
  let total = 0

  for (;;) {
    const result = await getCustomersApi.getCustomers({
      page,
      limit: WALLET_MONTH_PAGE_LIMIT,
    })

    if (result.summary) {
      return {
        total: result.summary.total,
        joinedThisMonth: result.summary.joinedThisMonth,
      }
    }

    total = result.total
    const pageSummary = summarizeCustomers(result.data, now)
    joinedThisMonth += pageSummary.joinedThisMonth

    const totalPages = result.totalPages ?? 1
    const lastPage = result.data.length === 0 || page >= totalPages
    const includesOlder = pageSummary.joinedThisMonth < result.data.length
    if (lastPage || includesOlder) {
      return { total, joinedThisMonth }
    }

    page += 1
  }
}

export function useCustomers(getCustomersApi: GetCustomersApi) {
  const pageSize = ref(10)
  const currentPage = ref(1)
  const searchQuery = ref('')
  const debouncedSearch = ref('')
  const rankFilter = ref<CustomerRank | null>(null)
  const sortKey = ref<CustomerSortKey>('createdAt')
  const sortDirection = ref<CustomerSortDirection>('desc')

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

  const listParams = computed<GetCustomersParams>(() => {
    const params: GetCustomersParams = {
      page: currentPage.value,
      limit: pageSize.value,
    }

    const search = debouncedSearch.value.trim()
    if (search) params.search = search

    if (rankFilter.value) params.rank = rankFilter.value

    params.sort = sortKey.value
    params.direction = sortDirection.value

    return params
  })

  const query = useQuery({
    queryKey: customerQueryKeys.list(listParams),
    queryFn: () => getCustomersApi.getCustomers(listParams.value),
    placeholderData: keepPreviousData,
  })

  const customers = computed<Customer.ListItem[]>(() => query.data.value?.data ?? [])
  const filteredCustomers = computed(() => customers.value)
  const total = computed(() => query.data.value?.total ?? 0)
  const hasSummary = computed(() => query.data.value?.summary != null)
  const summary = computed(
    () => query.data.value?.summary ?? emptyCustomerWalletSummary(),
  )

  const walletMonth = useQuery({
    queryKey: customerQueryKeys.joinedThisMonth(),
    queryFn: () => readJoinedThisMonth(getCustomersApi),
    enabled: computed(() => query.isSuccess.value && !hasSummary.value),
  })

  const joinedThisMonth = computed(
    () =>
      query.data.value?.summary?.joinedThisMonth ??
      walletMonth.data.value?.joinedThisMonth ??
      0,
  )
  const walletTotal = computed(
    () => query.data.value?.summary?.total ?? walletMonth.data.value?.total ?? 0,
  )
  const hasJoinedThisMonth = computed(
    () => hasSummary.value || walletMonth.isSuccess.value,
  )

  const toggleRankFilter = (rank: CustomerRank) => {
    rankFilter.value = rankFilter.value === rank ? null : rank
    currentPage.value = 1
  }

  const toggleSort = (key: CustomerSortKey) => {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      currentPage.value = 1
      return
    }

    sortKey.value = key
    sortDirection.value = key === 'createdAt' ? 'desc' : 'asc'
    currentPage.value = 1
  }

  return {
    customers,
    filteredCustomers,
    pageSize,
    currentPage,
    searchQuery,
    rankFilter,
    toggleRankFilter,
    sortKey,
    sortDirection,
    toggleSort,
    summary,
    hasSummary,
    joinedThisMonth,
    walletTotal,
    hasJoinedThisMonth,
    total,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
