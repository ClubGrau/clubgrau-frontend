import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { indicationCatalogErrorKey } from './indication-write-error'
import { indicationQueryKeys } from '../../services/api/indications/query-keys'
import type { GetIndicationCatalogApi } from '../../services/api/indications/types'
import type { Indication } from '../../types/indication'

const emptyCatalog: Indication.Catalog = { categories: [] }

export function useIndications(getCatalogApi: GetIndicationCatalogApi) {
  const query = useQuery({
    queryKey: indicationQueryKeys.catalog,
    queryFn: () => getCatalogApi.getCatalog(),
  })

  const catalogErrorKey = computed(() =>
    query.isError.value ? indicationCatalogErrorKey(query.error.value) : null,
  )

  return {
    categories: computed(() => query.data.value?.categories ?? emptyCatalog.categories),
    isLoading: query.isLoading,
    catalogErrorKey,
  }
}
