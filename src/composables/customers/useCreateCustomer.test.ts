import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { CreateCustomerApi } from '../../services/api/customers/types'
import type { Customer } from '../../types/customer'
import { useToast } from '../useToast'
import { toCreateCustomerParams, useCreateCustomer } from './useCreateCustomer'

const { toasts, dismiss } = useToast()

function dismissAllToasts() {
  for (const toast of [...toasts.value]) {
    dismiss(toast.id)
  }
}

function payload(overrides: Partial<Customer.CreateCommand> = {}): Customer.CreateCommand {
  return {
    name: 'Ana Costa',
    email: 'ana@costa.com',
    phone: '+351912345678',
    nif: '123456789',
    referral: 'Marina Albuquerque',
    rank: 'BRONZE',
    ...overrides,
  }
}

function withCreate(
  api: CreateCustomerApi,
  options: Parameters<typeof useCreateCustomer>[1],
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
    scope.run(() => useCreateCustomer(api, options)),
  )
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
  it('forwards the command fields', () => {
    expect(toCreateCustomerParams(payload())).toEqual({
      name: 'Ana Costa',
      email: 'ana@costa.com',
      phone: '+351912345678',
      nif: '123456789',
      referral: 'Marina Albuquerque',
      rank: 'BRONZE',
    })
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
