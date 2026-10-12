import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, ref } from 'vue'
import type { GetIndicationCatalogApi } from '../../services/api/indications/types'
import type { Indication, IndicationCategoryId } from '../../types/indication'
import { useCustomerIndicationOptions } from './useCustomerIndicationOptions'

const catalog: Indication.Catalog = {
  categories: [
    {
      id: 'canal',
      name: 'Canal',
      holdsOrigins: true,
      origins: [
        { id: 'canal-active', categoryId: 'canal', name: 'Facebook', active: true },
        { id: 'canal-ended', categoryId: 'canal', name: 'Orkut', active: false },
      ],
    },
    {
      id: 'campanha',
      name: 'Campanha',
      holdsOrigins: true,
      origins: [{ id: 'campanha-active', categoryId: 'campanha', name: 'Verão', active: true }],
    },
    { id: 'amigo', name: 'Amigo', holdsOrigins: false, origins: [] },
  ],
}

function withOptions(api: GetIndicationCatalogApi) {
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

  it('does not read the catalog for Amigo', async () => {
    const api: GetIndicationCatalogApi = {
      getCatalog: vi.fn().mockResolvedValue(catalog),
    }
    const { composable, categoryId, dispose } = withOptions(api)

    categoryId.value = 'amigo'
    await vi.waitFor(() => {
      expect(composable.isLoading.value).toBe(false)
    })
    expect(api.getCatalog).not.toHaveBeenCalled()
    expect(composable.origins.value).toEqual([])

    dispose()
  })

  it('reads the catalog when Canal is selected and reuses it for Campanha', async () => {
    const api: GetIndicationCatalogApi = {
      getCatalog: vi.fn().mockResolvedValue(catalog),
    }
    const { composable, categoryId, dispose } = withOptions(api)

    expect(api.getCatalog).not.toHaveBeenCalled()

    categoryId.value = 'canal'
    await vi.waitFor(() => {
      expect(composable.origins.value.map((origin) => origin.id)).toEqual(['canal-active'])
    })
    expect(api.getCatalog).toHaveBeenCalledTimes(1)

    categoryId.value = 'campanha'
    expect(composable.origins.value.map((origin) => origin.id)).toEqual(['campanha-active'])
    expect(api.getCatalog).toHaveBeenCalledTimes(1)

    dispose()
  })
})
