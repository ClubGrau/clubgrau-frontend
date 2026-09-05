import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { RemoveCustomerApi } from '../../services/api/customers/types'
import { useToast } from '../useToast'
import { useRemoveCustomer } from './useRemoveCustomer'

const { toasts, dismiss } = useToast()

function dismissAllToasts() {
  for (const toast of [...toasts.value]) {
    dismiss(toast.id)
  }
}

function withRemove(
  api: RemoveCustomerApi,
  options: Parameters<typeof useRemoveCustomer>[1],
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: false },
    },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() =>
    scope.run(() => useRemoveCustomer(api, options)),
  )
  if (!composable) {
    throw new Error('useRemoveCustomer did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useRemoveCustomer', () => {
  afterEach(dismissAllToasts)

  it('calls the remove port and notifies onRemoved', async () => {
    const onRemoved = vi.fn()
    const api: RemoveCustomerApi = {
      remove: vi.fn().mockResolvedValue({ id: 'cust-1' }),
    }
    const { composable, dispose } = withRemove(api, { onRemoved })

    composable.remove('cust-1')

    await vi.waitFor(() => {
      expect(api.remove).toHaveBeenCalledWith({ id: 'cust-1' })
      expect(onRemoved).toHaveBeenCalledWith({ id: 'cust-1' })
    })

    dispose()
  })

  it('does not call the port without an id', () => {
    const api: RemoveCustomerApi = {
      remove: vi.fn(),
    }
    const { composable, dispose } = withRemove(api, { onRemoved: vi.fn() })

    composable.remove('')

    expect(api.remove).not.toHaveBeenCalled()
    dispose()
  })
})
