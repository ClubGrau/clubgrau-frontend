import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../../i18n'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type {
  CreateCustomerApi,
  CreateCustomerParams,
  CreateCustomerResult,
} from '../../services/api/customers/types'
import type { Customer } from '../../types/customer'
import { useToast } from '../useToast'

export function toCreateCustomerParams(
  payload: Customer.CreateCommand,
): CreateCustomerParams {
  return {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    nif: payload.nif,
    referral: payload.referral,
    rank: payload.rank,
  }
}

interface CreateCustomerOptions {
  onCreated: (result: CreateCustomerResult) => void
}

export function useCreateCustomer(
  api: CreateCustomerApi,
  options: CreateCustomerOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (payload: Customer.CreateCommand) =>
      api.create(toCreateCustomerParams(payload)),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all })
      toast.push('success', t('Customers.toast.created'))
      options.onCreated(result)
    },
    onError: () => {
      toast.push('error', t('Customers.toast.unexpected'))
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
