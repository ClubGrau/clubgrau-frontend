import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toApiError } from '../../domain/api-error'
import { t } from '../../i18n'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type {
  RemoveCustomerApi,
  RemoveCustomerParams,
  RemoveCustomerResult,
} from '../../services/api/customers/types'
import { useToast } from '../useToast'

export function toastKeyForRemoveCustomerError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Customers.toast.removeForbidden'
  if (mapped.code === 'ALREADY_REMOVED' || mapped.code === 'CONFLICT') {
    return 'Customers.toast.alreadyRemoved'
  }
  return 'Customers.toast.unexpected'
}

interface RemoveCustomerOptions {
  onRemoved: (result: RemoveCustomerResult) => void
  onAlreadyRemoved?: (id: string) => void
  onForbidden?: () => void
}

export function useRemoveCustomer(
  api: RemoveCustomerApi,
  options: RemoveCustomerOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const removeError = ref<string | null>(null)

  const mutation = useMutation({
    mutationFn: (params: RemoveCustomerParams) => api.remove(params),
    retry: 0,
    onMutate: () => {
      removeError.value = null
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all })
      toast.push('success', t('Customers.toast.removed'))
      options.onRemoved(result)
    },
    onError: (error, variables) => {
      const mapped = toApiError(error)
      if (mapped.code === 'UNAUTHORIZED') {
        removeError.value = t('Customers.toast.removeUnauthorized')
        return
      }

      const key = toastKeyForRemoveCustomerError(error)
      if (key) toast.push('error', t(key))

      if (mapped.code === 'ALREADY_REMOVED' || mapped.code === 'CONFLICT') {
        void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all })
        options.onAlreadyRemoved?.(variables.id)
        return
      }

      if (mapped.code === 'FORBIDDEN') {
        options.onForbidden?.()
      }
    },
  })

  const remove = (params: RemoveCustomerParams) => {
    if (!params.id || !params.password || mutation.isPending.value) return
    mutation.mutate(params)
  }

  return {
    remove,
    isRemoving: mutation.isPending,
    removeError,
  }
}
