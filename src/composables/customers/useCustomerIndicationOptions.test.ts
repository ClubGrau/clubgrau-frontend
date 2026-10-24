import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, ref } from 'vue'
import type { GetLinkableIndicationOriginsApi } from '../../services/api/indications/types'
import type { Indication, IndicationCategoryId } from '../../types/indication'
import { useCustomerIndicationOptions } from './useCustomerIndicationOptions'

const origins: Indication.LinkableOrigin[] = [
  { id: 'canal-active', categoryId: 'canal', name: 'Facebook' },
  { id: 'campanha-active', categoryId: 'campanha', name: 'Verão' },
]

function withOptions(api: GetLinkableIndicationOriginsApi) {
  const categoryId = ref<IndicationCategoryId | null>(null)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() =>
    scope.run(() => useCustomerIndicationOptions(api, categoryId)),
  )
  if (!composable) {
    throw new Error('useCustomerIndicationOptions did not return inside the Vue context')
  }
  return {
    composable,
    categoryId,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useCustomerIndicationOptions', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not read linkable origins for Amigo', async () => {
    const api: GetLinkableIndicationOriginsApi = {
      getLinkableOrigins: vi.fn().mockResolvedValue(origins),
    }
    const { composable, categoryId, dispose } = withOptions(api)

    categoryId.value = 'amigo'
    await vi.waitFor(() => {
      expect(composable.isLoading.value).toBe(false)
    })
    expect(api.getLinkableOrigins).not.toHaveBeenCalled()
    expect(composable.origins.value).toEqual([])

    dispose()
  })

  it('reads linkable origins when Canal is selected and reuses them for Campanha', async () => {
    const api: GetLinkableIndicationOriginsApi = {
      getLinkableOrigins: vi.fn().mockResolvedValue(origins),
    }
    const { composable, categoryId, dispose } = withOptions(api)

    expect(api.getLinkableOrigins).not.toHaveBeenCalled()

    categoryId.value = 'canal'
    await vi.waitFor(() => {
      expect(composable.origins.value.map((origin) => origin.id)).toEqual(['canal-active'])
    })
    expect(api.getLinkableOrigins).toHaveBeenCalledTimes(1)

    categoryId.value = 'campanha'
    expect(composable.origins.value.map((origin) => origin.id)).toEqual(['campanha-active'])
    expect(api.getLinkableOrigins).toHaveBeenCalledTimes(1)

    dispose()
  })
})
