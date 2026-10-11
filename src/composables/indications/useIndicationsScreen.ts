import { computed, ref } from 'vue'
import { httpIndicationsApi } from '../../services/api/indications/http-indications-api'
import type {
  CorrectIndicationOriginNameApi,
  CreateIndicationOriginApi,
  EndIndicationOriginApi,
  GetIndicationCatalogApi,
  ReopenIndicationOriginApi,
} from '../../services/api/indications/types'
import { useCorrectIndicationOriginName } from './useCorrectIndicationOriginName'
import { useCreateIndicationOrigin } from './useCreateIndicationOrigin'
import { useEndIndication } from './useEndIndication'
import { useIndications } from './useIndications'
import { useReopenIndication } from './useReopenIndication'

export function useIndicationsScreen(
  api: GetIndicationCatalogApi &
    CreateIndicationOriginApi &
    CorrectIndicationOriginNameApi &
    EndIndicationOriginApi &
    ReopenIndicationOriginApi = httpIndicationsApi,
) {
  const catalog = useIndications(api)
  const editor = ref<'create' | 'correct' | null>(null)
  const correctingId = ref<string | null>(null)

  const closeEditor = () => {
    editor.value = null
    correctingId.value = null
  }

  const { createOrigin, isCreatingOrigin } = useCreateIndicationOrigin(api, {
    onCreated: closeEditor,
  })
  const { correctName, isCorrectingName } = useCorrectIndicationOriginName(api, {
    onCorrected: closeEditor,
  })
  const { end, isEnding } = useEndIndication(api)
  const { reopen, isReopening } = useReopenIndication(api)

  const correcting = computed(() => {
    const id = correctingId.value
    if (!id) return null
    for (const category of catalog.categories.value) {
      const origin = category.origins.find((item) => item.id === id)
      if (origin) return { origin, categoryName: category.name }
    }
    return null
  })

  const openCreate = () => {
    correctingId.value = null
    editor.value = 'create'
  }

  const openCorrect = (id: string) => {
    correctingId.value = id
    editor.value = 'correct'
  }

  return {
    ...catalog,
    editor,
    correcting,
    isCreatingOrigin,
    isCorrectingName,
    isEnding,
    isReopening,
    openCreate,
    openCorrect,
    closeEditor,
    createOrigin,
    correctName,
    end,
    reopen,
  }
}
