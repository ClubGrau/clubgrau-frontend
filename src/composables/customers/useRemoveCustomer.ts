import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../../i18n'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type {
  RemoveCustomerApi,
  RemoveCustomerParams,
  RemoveCustomerResult,
} from '../../services/api/customers/types'
import { useToast } from '../useToast'

interface RemoveCustomerOptions {
  onRemoved: (result: RemoveCustomerResult) => void
}

export function useRemoveCustomer(
  api: RemoveCustomerApi,
  options: RemoveCustomerOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (params: RemoveCustomerParams) => api.remove(params),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all })
      toast.push('success', t('Customers.toast.removed'))
      options.onRemoved(result)
    },
    onError: () => {
      toast.push('error', t('Customers.toast.unexpected'))
    },
  })

  const remove = (id: string) => {
    if (!id || mutation.isPending.value) return
    mutation.mutate({ id })
  }

  return {
    remove,
    isRemoving: mutation.isPending,
  }
}
