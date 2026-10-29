import { computed, onUnmounted, ref, watch } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type {
  GetCustomersApi,
  GetCustomersParams,
} from '../../services/api/customers/types'
import {
  addWalletSummary,
  emptyCustomerWalletSummary,
  summarizeCustomers,
  withBalancedIndication,
  type CustomerWalletSummary,
} from '../../domain/customer-wallet'
import type {
  Customer,
  CustomerRank,
  CustomerSortDirection,
  CustomerSortKey,
} from '../../types/customer'

/** Matches the API page cap so one read can cover the wallet in few requests. */
const WALLET_MONTH_PAGE_LIMIT = 100

const WALLET_PAGE_CAP = 50

/**
 * Counts the whole wallet: rank, indication, and who joined this month and last.
 * GET /api/customers has no wallet summary, so this walks every page.
 * A source that already returns `summary` is used as-is.
 */
export async function readWalletSummary(
  getCustomersApi: GetCustomersApi,
  now = new Date(),
): Promise<CustomerWalletSummary> {
  const summary = emptyCustomerWalletSummary()
  let page = 1
  let total = 0

  for (;;) {
    const result = await getCustomersApi.getCustomers({
      page,
      limit: WALLET_MONTH_PAGE_LIMIT,
    })

    if (result.summary) return withBalancedIndication(result.summary)

    total = result.total
    addWalletSummary(summary, summarizeCustomers(result.data, now))

    const totalPages = result.totalPages ?? 1
    if (result.data.length === 0 || page >= totalPages || page >= WALLET_PAGE_CAP) {
      summary.total = total
      return withBalancedIndication(summary)
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
  const listSummary = computed(() => query.data.value?.summary)

  const wallet = useQuery({
    queryKey: customerQueryKeys.wallet(),
    queryFn: () => readWalletSummary(getCustomersApi),
    enabled: computed(() => query.isSuccess.value && listSummary.value == null),
  })

  const summary = computed(() =>
    withBalancedIndication(
      listSummary.value ?? wallet.data.value ?? emptyCustomerWalletSummary(),
    ),
  )
  const hasSummary = computed(() => listSummary.value != null || wallet.isSuccess.value)
  const joinedThisMonth = computed(() => summary.value.joinedThisMonth)
  const walletTotal = computed(() => summary.value.total)
  const hasJoinedThisMonth = hasSummary

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
