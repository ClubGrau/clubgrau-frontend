import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { isIndicationOriginCategoryId, selectableOrigins } from '../../domain/customer-indication'
import type { IndicationCategoryId } from '../../types/indication'
import { indicationQueryKeys } from '../../services/api/indications/query-keys'
import type { GetLinkableIndicationOriginsApi } from '../../services/api/indications/types'

/**
 * The linkable read returns every active Canal and Campanha origin in one
 * payload. Ask for it only after one of those categories is chosen, then
 * keep the origins of that type. Amigo does not call this endpoint.
 * Switching Canal and Campanha does not call again.
 */
export function useCustomerIndicationOptions(
  api: GetLinkableIndicationOriginsApi,
  categoryId: Ref<IndicationCategoryId | null>,
) {
  const originCategoryId = computed(() => {
    const id = categoryId.value
    return id && isIndicationOriginCategoryId(id) ? id : null
  })

  const query = useQuery({
    queryKey: indicationQueryKeys.linkableOrigins,
    queryFn: () => api.getLinkableOrigins(),
    enabled: computed(() => originCategoryId.value !== null),
  })

  const origins = computed(() => {
    const id = originCategoryId.value
    if (!id) return []
    return selectableOrigins(query.data.value ?? [], id)
  })

  const isLoading = computed(
    () =>
      originCategoryId.value !== null &&
      query.isFetching.value &&
      query.data.value === undefined,
  )

  const errorKey = computed(() =>
    originCategoryId.value && query.isError.value
      ? 'Customers.form.indication.loadError'
      : null,
  )

  return {
    origins,
    isLoading,
    errorKey,
  }
}
