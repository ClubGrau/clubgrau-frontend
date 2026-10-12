import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { isIndicationOriginCategoryId, selectableOrigins } from '../../domain/customer-indication'
import type { IndicationCategoryId } from '../../types/indication'
import { indicationCatalogErrorKey } from '../indications/indication-write-error'
import { indicationQueryKeys } from '../../services/api/indications/query-keys'
import type { GetIndicationCatalogApi } from '../../services/api/indications/types'

/**
 * The catalog read returns every category in one payload. Ask for it only
 * after Canal or Campanha is chosen, then keep the active origins of that
 * type. Amigo does not call this endpoint. Switching Canal and Campanha
 * does not call again.
 */
export function useCustomerIndicationOptions(
  api: GetIndicationCatalogApi,
  categoryId: Ref<IndicationCategoryId | null>,
) {
  const catalogCategoryId = computed(() => {
    const id = categoryId.value
    return id && isIndicationOriginCategoryId(id) ? id : null
  })

  const query = useQuery({
    queryKey: indicationQueryKeys.catalog,
    queryFn: () => api.getCatalog(),
    enabled: computed(() => catalogCategoryId.value !== null),
  })

  const origins = computed(() => {
    const id = catalogCategoryId.value
    if (!id) return []
    return selectableOrigins(query.data.value?.categories ?? [], id)
  })

  const isLoading = computed(
    () =>
      catalogCategoryId.value !== null &&
      query.isFetching.value &&
      query.data.value === undefined,
  )

  const errorKey = computed(() =>
    catalogCategoryId.value && query.isError.value
      ? indicationCatalogErrorKey(query.error.value)
      : null,
  )

  return {
    origins,
    isLoading,
    errorKey,
  }
}
