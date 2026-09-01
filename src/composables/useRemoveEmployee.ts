import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../i18n'
import { toApiError } from '../domain/api-error'
import { employeeQueryKeys } from '../services/api/employees/query-keys'
import type {
  RemoveEmployeeApi,
  RemoveEmployeeParams,
  RemoveEmployeeResult,
} from '../services/api/employees/types'
import { useToast } from './useToast'

export function toastKeyForRemoveError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'LAST_ADMIN') return 'Employees.toast.lastAdmin'
  if (mapped.code === 'FORBIDDEN') return 'Employees.toast.forbidden'
  return mapped.message ? 'Employees.toast.unexpected' : null
}

interface RemoveEmployeeOptions {
  onRemoved: (result: RemoveEmployeeResult) => void
  onRemoveConflict: (id: string) => void
}

export function useRemoveEmployee(
  api: RemoveEmployeeApi,
  options: RemoveEmployeeOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const removeError = ref<string | null>(null)

  const mutation = useMutation({
    mutationFn: (params: RemoveEmployeeParams) => api.remove(params),
    retry: 0,
    onMutate: () => {
      removeError.value = null
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      toast.push('success', t('Employees.toast.removed'))
      options.onRemoved(result)
    },
    onError: (error, variables) => {
      const mapped = toApiError(error)
      if (mapped.code === 'UNAUTHORIZED') {
        removeError.value = t('Employees.toast.removeUnauthorized')
        return
      }

      const key = toastKeyForRemoveError(error)
      if (key) toast.push('error', t(key))

      if (
        mapped.code === 'NOT_INACTIVE' ||
        mapped.code === 'ALREADY_REMOVED' ||
        mapped.code === 'CONFLICT'
      ) {
        void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      }

      if (
        mapped.code === 'LAST_ADMIN' ||
        mapped.code === 'FORBIDDEN' ||
        mapped.code === 'NOT_INACTIVE' ||
        mapped.code === 'ALREADY_REMOVED' ||
        mapped.code === 'CONFLICT'
      ) {
        options.onRemoveConflict(variables.id)
      }
    },
  })

  const remove = (params: RemoveEmployeeParams) => {
    if (!params.id || !params.password || mutation.isPending.value) return
    mutation.mutate(params)
  }

  return {
    remove,
    isRemoving: mutation.isPending,
    removeError,
  }
}
