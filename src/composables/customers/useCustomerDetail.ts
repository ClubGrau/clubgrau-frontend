import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type { GetCustomerApi } from '../../services/api/customers/types'
import type { Customer } from '../../types/customer'

export function useCustomerDetail(api: GetCustomerApi) {
  const customerId = ref<string | null>(null)

  const query = useQuery({
    queryKey: computed(() => customerQueryKeys.detail(customerId.value ?? '')),
    queryFn: () => api.getCustomer(customerId.value ?? ''),
    enabled: computed(() => customerId.value !== null),
  })

  const customer = computed<Customer.ListItem | null>(() => {
    if (!customerId.value) return null
    return query.data.value ?? null
  })

  const open = (id: string) => {
    customerId.value = id
  }

  const close = () => {
    customerId.value = null
  }

  return {
    customerId,
    customer,
    isLoading: query.isFetching,
    open,
    close,
  }
}
