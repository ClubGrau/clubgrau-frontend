import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../../i18n'
import { toApiError } from '../../domain/api-error'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type {
  CreateCustomerApi,
  CreateCustomerParams,
  CreateCustomerResult,
} from '../../services/api/customers/types'
import type { Customer } from '../../types/customer'
import { useToast } from '../useToast'

function optionalText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function optionalNif(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return null
  return Number(trimmed)
}

export function toCreateCustomerParams(payload: Customer.CreateCommand): CreateCustomerParams {
  return {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: optionalText(payload.phone),
    nif: optionalNif(payload.nif),
    indication: payload.indication,
  }
}

export function toastKeyForCreateCustomerError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Customers.toast.forbidden'
  if (mapped.code === 'CONFLICT') return 'Customers.toast.emailInUse'
  if (mapped.code === 'BAD_REQUEST') return 'Customers.toast.createValidation'
  return 'Customers.toast.unexpected'
}

interface CreateCustomerOptions {
  onCreated: (result: CreateCustomerResult) => void
}

export function useCreateCustomer(api: CreateCustomerApi, options: CreateCustomerOptions) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (payload: Customer.CreateCommand) => api.create(toCreateCustomerParams(payload)),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all })
      toast.push('success', t('Customers.toast.created'))
      options.onCreated(result)
    },
    onError: (error) => {
      const key = toastKeyForCreateCustomerError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const create = (payload: Customer.CreateCommand) => {
    if (mutation.isPending.value) return
    mutation.mutate(payload)
  }

  return {
    create,
    isCreating: mutation.isPending,
  }
}
