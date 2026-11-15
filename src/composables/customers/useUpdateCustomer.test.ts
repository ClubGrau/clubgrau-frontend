import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type { UpdateCustomerApi } from '../../services/api/customers/types'
import type { Customer } from '../../types/customer'
import { useToast } from '../useToast'
import {
  hasCustomerUpdateChanges,
  toastKeyForUpdateCustomerError,
  toUpdateCustomerParams,
  useUpdateCustomer,
  type CustomerRegistrationSnapshot,
} from './useUpdateCustomer'

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

function payload(overrides: Partial<Customer.UpdateCommand> = {}): Customer.UpdateCommand {
  return {
    id: 'cust-1',
    name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '+351912345678',
    nif: '200000004',
    ...overrides,
  }
}

function original(
  overrides: Partial<CustomerRegistrationSnapshot> = {},
): CustomerRegistrationSnapshot {
  return {
    name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '351912345678',
    nif: '200000004',
    ...overrides,
  }
}

function updateInput(
  commandOverrides: Partial<Customer.UpdateCommand> = {},
  originalOverrides: Partial<CustomerRegistrationSnapshot> = {},
) {
  return { command: payload(commandOverrides), original: original(originalOverrides) }
}

function withUpdate(
  api: UpdateCustomerApi,
  options: Parameters<typeof useUpdateCustomer>[1],
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
  const composable = app.runWithContext(() => scope.run(() => useUpdateCustomer(api, options)))
  if (!composable) {
    throw new Error('useUpdateCustomer did not return inside the Vue context')
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

describe('toUpdateCustomerParams', () => {
  it('sends only changed fields in a sparse PATCH and ignores E.164 vs digits-only phone difference', () => {
    const params = toUpdateCustomerParams(
      payload({ name: '  Maria   Santos ' }),
      original(),
    )

    expect(params).toEqual({
      id: 'cust-1',
      name: 'Maria Santos',
    })
    expect(params).not.toHaveProperty('email')
    expect(params).not.toHaveProperty('phone')
    expect(params).not.toHaveProperty('nif')
  })

  it('sends null to clear optional phone and nif when emptied', () => {
    const params = toUpdateCustomerParams(
      payload({ phone: '+351', nif: '   ' }),
      original(),
    )

    expect(params).toEqual({
      id: 'cust-1',
      phone: null,
      nif: null,
    })
  })

  it('omits phone and nif when they stayed empty', () => {
    const params = toUpdateCustomerParams(
      payload({ email: 'nova@example.com', phone: '', nif: '' }),
      original({ phone: '', nif: '' }),
    )

    expect(params).toEqual({
      id: 'cust-1',
      email: 'nova@example.com',
    })
  })
})

describe('hasCustomerUpdateChanges', () => {
  it('returns false when only id is present', () => {
    expect(hasCustomerUpdateChanges({ id: 'cust-1' })).toBe(false)
  })

  it('returns true when an optional field is cleared to null', () => {
    expect(hasCustomerUpdateChanges({ id: 'cust-1', phone: null })).toBe(true)
  })
})

describe('toastKeyForUpdateCustomerError', () => {
  it('returns null on 401', () => {
    expect(toastKeyForUpdateCustomerError(httpError(401, 'Authentication failed'))).toBeNull()
  })

  it('maps 403 to updateForbidden', () => {
    expect(toastKeyForUpdateCustomerError(httpError(403, 'Forbidden'))).toBe(
      'Customers.toast.updateForbidden',
    )
  })

  it('maps 409 Customer already exists to emailInUse', () => {
    expect(toastKeyForUpdateCustomerError(httpError(409, 'Customer already exists'))).toBe(
      'Customers.toast.emailInUse',
    )
  })

  it('maps 409 Customer is already removed to alreadyRemoved', () => {
    expect(toastKeyForUpdateCustomerError(httpError(409, 'Customer is already removed'))).toBe(
      'Customers.toast.alreadyRemoved',
    )
  })

  it('maps 400 to updateValidation and 500 to unexpected', () => {
    expect(
      toastKeyForUpdateCustomerError(httpError(400, 'NIF must have exactly 9 digits')),
    ).toBe('Customers.toast.updateValidation')
    expect(toastKeyForUpdateCustomerError(httpError(500, 'Internal'))).toBe(
      'Customers.toast.unexpected',
    )
  })
})

describe('useUpdateCustomer', () => {
  afterEach(dismissAllToasts)

  it('calls update without actorId, invalidates customer queries, shows success toast, and calls onUpdated', async () => {
    const onUpdated = vi.fn()
    const update = vi.fn().mockResolvedValue({ id: 'cust-1' })
    const { composable, queryClient, dispose } = withUpdate({ update }, { onUpdated })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    composable.update(updateInput({ name: 'Maria Santos' }))
    await flushPromises()

    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith({
      id: 'cust-1',
      name: 'Maria Santos',
    })
    expect(update.mock.calls[0]?.[0]).not.toHaveProperty('actorId')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerQueryKeys.all })
    expect(onUpdated).toHaveBeenCalledWith({ id: 'cust-1' })
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Dados do cliente atualizados.',
    })

    dispose()
  })

  it('does not call the API when nothing changed and invokes onNoChanges', async () => {
    const onUpdated = vi.fn()
    const onNoChanges = vi.fn()
    const update = vi.fn()
    const { composable, dispose } = withUpdate({ update }, { onUpdated, onNoChanges })

    composable.update(updateInput())
    await flushPromises()

    expect(update).not.toHaveBeenCalled()
    expect(onUpdated).not.toHaveBeenCalled()
    expect(onNoChanges).toHaveBeenCalledTimes(1)

    dispose()
  })

  it('on 409 email collision pushes emailInUse toast and does not call onUpdated', async () => {
    const onUpdated = vi.fn()
    const { composable, dispose } = withUpdate(
      { update: vi.fn().mockRejectedValue(httpError(409, 'Customer already exists')) },
      { onUpdated },
    )

    composable.update(updateInput({ email: 'ocupado@example.com' }))
    await flushPromises()

    expect(onUpdated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Este e-mail já está em uso.',
    })

    dispose()
  })

  it('on 409 already removed invalidates queries, toasts alreadyRemoved, and calls onAlreadyRemoved', async () => {
    const onUpdated = vi.fn()
    const onAlreadyRemoved = vi.fn()
    const { composable, queryClient, dispose } = withUpdate(
      { update: vi.fn().mockRejectedValue(httpError(409, 'Customer is already removed')) },
      { onUpdated, onAlreadyRemoved },
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    composable.update(updateInput({ name: 'Maria Santos' }))
    await flushPromises()

    expect(onUpdated).not.toHaveBeenCalled()
    expect(onAlreadyRemoved).toHaveBeenCalledWith('cust-1')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerQueryKeys.all })
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Este cliente já foi removido.',
    })

    dispose()
  })
})
