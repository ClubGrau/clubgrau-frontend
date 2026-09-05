import { computed, onUnmounted, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type {
  GetCustomersApi,
  GetCustomersParams,
} from '../../services/api/customers/types'
import type { Customer, CustomerRank } from '../../types/customer'

export function useCustomers(getCustomersApi: GetCustomersApi) {
  const pageSize = ref(10)
  const currentPage = ref(1)
  const searchQuery = ref('')
  const debouncedSearch = ref('')
  const rankFilter = ref<CustomerRank | null>(null)

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

    return params
  })

  const query = useQuery({
    queryKey: customerQueryKeys.list(listParams),
    queryFn: () => getCustomersApi.getCustomers(listParams.value),
  })

  const customers = computed<Customer.ListItem[]>(() => query.data.value?.data ?? [])
  const filteredCustomers = computed(() => customers.value)
  const total = computed(() => query.data.value?.total ?? 0)

  const toggleRankFilter = (rank: CustomerRank) => {
    rankFilter.value = rankFilter.value === rank ? null : rank
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
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
