import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { CreateCustomerApi } from '../../services/api/customers/types'
import type { Customer } from '../../types/customer'
import { useToast } from '../useToast'
import {
  toastKeyForCreateCustomerError,
  toCreateCustomerParams,
  useCreateCustomer,
} from './useCreateCustomer'

const { toasts, dismiss } = useToast()

function dismissAllToasts() {
  for (const toast of [...toasts.value]) {
    dismiss(toast.id)
  }
}

function httpError(status: number, error?: string) {
  return {
    response: {
      status,
      data: error === undefined ? {} : { error },
    },
  }
}

function payload(overrides: Partial<Customer.CreateCommand> = {}): Customer.CreateCommand {
  return {
    name: 'Ana Costa',
    email: 'ana@costa.com',
    phone: '+351912345678',
    nif: '123456789',
    indication: null,
    ...overrides,
  }
}

function withCreate(api: CreateCustomerApi, options: Parameters<typeof useCreateCustomer>[1]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: false },
    },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() => scope.run(() => useCreateCustomer(api, options)))
  if (!composable) {
    throw new Error('useCreateCustomer did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toCreateCustomerParams', () => {
  it('sends a walk-in with empty optionals as null and no rank', () => {
    const params = toCreateCustomerParams(
      payload({ phone: '   ', nif: '', indication: null }),
    )
    expect(params).toEqual({
      name: 'Ana Costa',
      email: 'ana@costa.com',
      phone: null,
      nif: null,
      indication: null,
    })
    expect(params).not.toHaveProperty('rank')
    expect(params).not.toHaveProperty('wasReferred')
    expect(params).not.toHaveProperty('referral')
  })

  it('sends a channel indication with only the origin id', () => {
    const params = toCreateCustomerParams(
      payload({
        indication: { categoryId: 'canal', originId: 'origin-1' },
      }),
    )
    expect(params.nif).toBe(123456789)
    expect(params.indication).toEqual({ categoryId: 'canal', originId: 'origin-1' })
    expect(Object.keys(params.indication ?? {})).toEqual(['categoryId', 'originId'])
  })

  it('sends a friend indication with only the referrer id', () => {
    const params = toCreateCustomerParams(
      payload({
        indication: { categoryId: 'amigo', referrerCustomerId: 'cust-1' },
      }),
    )
    expect(params.indication).toEqual({
      categoryId: 'amigo',
      referrerCustomerId: 'cust-1',
    })
    expect(Object.keys(params.indication ?? {})).toEqual(['categoryId', 'referrerCustomerId'])
  })
})

describe('toastKeyForCreateCustomerError', () => {
  it('maps 409 to the email key and does not use the English API string', () => {
    expect(toastKeyForCreateCustomerError(httpError(409, 'Customer already exists'))).toBe(
      'Customers.toast.emailInUse',
    )
  })

  it('maps 400 to the validation key', () => {
    expect(
      toastKeyForCreateCustomerError(httpError(400, 'Customer indication origin is ended')),
    ).toBe('Customers.toast.createValidation')
  })

  it('maps 403 to the forbidden key', () => {
    expect(toastKeyForCreateCustomerError(httpError(403, 'Action not allowed'))).toBe(
      'Customers.toast.forbidden',
    )
  })

  it('does not emit a create toast on 401', () => {
    expect(toastKeyForCreateCustomerError(httpError(401, 'Authentication failed'))).toBeNull()
  })
})

describe('useCreateCustomer', () => {
  afterEach(dismissAllToasts)

  it('calls the create port and notifies onCreated', async () => {
    const onCreated = vi.fn()
    const api: CreateCustomerApi = {
      create: vi.fn().mockResolvedValue({ id: 'cust-new' }),
    }
    const { composable, dispose } = withCreate(api, { onCreated })

    composable.create(payload())

    await vi.waitFor(() => {
      expect(api.create).toHaveBeenCalledWith(toCreateCustomerParams(payload()))
      expect(onCreated).toHaveBeenCalledWith({ id: 'cust-new' })
    })

    dispose()
  })
})
