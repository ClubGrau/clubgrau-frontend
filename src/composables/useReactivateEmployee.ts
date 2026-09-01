import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../i18n'
import { toApiError } from '../domain/api-error'
import { employeeQueryKeys } from '../services/api/employees/query-keys'
import type {
  UpdateEmployeeStatusApi,
  UpdateEmployeeStatusResult,
} from '../services/api/employees/types'
import { useToast } from './useToast'

export function toastKeyForReactivateError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Employees.toast.forbidden'
  return mapped.message ? 'Employees.toast.unexpected' : null
}

interface ReactivateEmployeeOptions {
  onReactivated: (result: UpdateEmployeeStatusResult) => void
}

export function useReactivateEmployee(
  api: UpdateEmployeeStatusApi,
  options: ReactivateEmployeeOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (id: string) => api.updateStatus({ id, status: 'ACTIVE' }),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      toast.push('success', t('Employees.toast.reactivated'))
      options.onReactivated(result)
    },
    onError: (error) => {
      const key = toastKeyForReactivateError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const reactivate = (id: string) => {
    if (!id || mutation.isPending.value) return
    mutation.mutate(id)
  }

  return {
    reactivate,
    isReactivating: mutation.isPending,
  }
}
