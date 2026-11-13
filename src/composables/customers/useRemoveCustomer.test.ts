import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type { RemoveCustomerApi } from '../../services/api/customers/types'
import { useToast } from '../useToast'
import {
  toastKeyForRemoveCustomerError,
  useRemoveCustomer,
} from './useRemoveCustomer'

const { toasts, dismiss } = useToast()

function dismissAllToasts() {
  for (const toast of [...toasts.value]) {
    dismiss(toast.id)
  }
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function httpError(status: number, error?: string) {
  return {
    response: {
      status,
      data: error === undefined ? {} : { error },
    },
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
    queryClient,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toastKeyForRemoveCustomerError', () => {
  it('returns null on 401 so the modal shows the inline credentials error', () => {
    expect(
      toastKeyForRemoveCustomerError(httpError(401, 'Authentication failed')),
    ).toBeNull()
  })

  it('maps 403 to the remove forbidden key', () => {
    expect(toastKeyForRemoveCustomerError(httpError(403, 'Forbidden'))).toBe(
      'Customers.toast.removeForbidden',
    )
  })

  it('maps 409 already removed and generic conflicts to alreadyRemoved', () => {
    expect(
      toastKeyForRemoveCustomerError(httpError(409, 'Customer is already removed')),
    ).toBe('Customers.toast.alreadyRemoved')
    expect(toastKeyForRemoveCustomerError(httpError(409, 'Conflict'))).toBe(
      'Customers.toast.alreadyRemoved',
    )
  })

  it('maps 400, 500, and network errors to unexpected', () => {
    expect(
      toastKeyForRemoveCustomerError(httpError(400, 'Customer was not found')),
    ).toBe('Customers.toast.unexpected')
    expect(toastKeyForRemoveCustomerError(httpError(500, 'Internal'))).toBe(
      'Customers.toast.unexpected',
    )
    expect(toastKeyForRemoveCustomerError(new Error('Network Error'))).toBe(
      'Customers.toast.unexpected',
    )
  })
})

describe('useRemoveCustomer', () => {
  afterEach(dismissAllToasts)

  it('calls remove with { id, password } and no actorId, invalidates customer queries, and notifies onRemoved', async () => {
    const onRemoved = vi.fn()
    const remove = vi.fn().mockResolvedValue({ id: 'cust-1' })
    const { composable, queryClient, dispose } = withRemove(
      { remove },
      { onRemoved },
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    composable.remove({ id: 'cust-1', password: 'secret' })
    await flushPromises()

    expect(remove).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith({ id: 'cust-1', password: 'secret' })
    expect(remove.mock.calls[0]?.[0]).not.toHaveProperty('actorId')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerQueryKeys.all })
    expect(onRemoved).toHaveBeenCalledWith({ id: 'cust-1' })
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message:
        'Cliente removido da carteira. O e-mail original está livre para um novo cadastro.',
    })
    expect(composable.removeError.value).toBeNull()

    dispose()
  })

  it('does not call the port when id or password is empty', () => {
    const remove = vi.fn()
    const { composable, dispose } = withRemove({ remove }, { onRemoved: vi.fn() })

    composable.remove({ id: '', password: 'secret' })
    composable.remove({ id: 'cust-1', password: '' })

    expect(remove).not.toHaveBeenCalled()
    dispose()
  })

  it('on 401 sets the opaque modal error, pushes no toast, and keeps modal state', async () => {
    const onRemoved = vi.fn()
    const onAlreadyRemoved = vi.fn()
    const { composable, queryClient, dispose } = withRemove(
      {
        remove: vi
          .fn()
          .mockRejectedValue(httpError(401, 'Authentication failed')),
      },
      { onRemoved, onAlreadyRemoved },
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    composable.remove({ id: 'cust-1', password: 'wrong' })
    await flushPromises()

    expect(onRemoved).not.toHaveBeenCalled()
    expect(onAlreadyRemoved).not.toHaveBeenCalled()
    expect(invalidateSpy).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(0)
    expect(composable.removeError.value).toBe(
      'Não foi possível confirmar a sua identidade. Verifique a palavra-passe.',
    )

    dispose()
  })

  it('on 409 already removed invalidates queries, toasts alreadyRemoved, and calls onAlreadyRemoved', async () => {
    const onRemoved = vi.fn()
    const onAlreadyRemoved = vi.fn()
    const { composable, queryClient, dispose } = withRemove(
      {
        remove: vi
          .fn()
          .mockRejectedValue(httpError(409, 'Customer is already removed')),
      },
      { onRemoved, onAlreadyRemoved },
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    composable.remove({ id: 'cust-1', password: 'secret' })
    await flushPromises()

    expect(onRemoved).not.toHaveBeenCalled()
    expect(onAlreadyRemoved).toHaveBeenCalledWith('cust-1')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerQueryKeys.all })
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Este cliente já foi removido.',
    })
    expect(composable.removeError.value).toBeNull()

    dispose()
  })

  it('on 403 toasts Ação não permitida and calls onForbidden', async () => {
    const onRemoved = vi.fn()
    const onForbidden = vi.fn()
    const { composable, dispose } = withRemove(
      {
        remove: vi.fn().mockRejectedValue(httpError(403, 'Forbidden')),
      },
      { onRemoved, onForbidden },
    )

    composable.remove({ id: 'cust-1', password: 'secret' })
    await flushPromises()

    expect(onRemoved).not.toHaveBeenCalled()
    expect(onForbidden).toHaveBeenCalledTimes(1)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Ação não permitida.',
    })

    dispose()
  })
})
