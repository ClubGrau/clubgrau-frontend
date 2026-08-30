import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../i18n'
import { toLifecycleError } from '../domain/lifecycle-error'
import { employeeQueryKeys } from '../services/api/employees/query-keys'
import type {
  UpdateEmployeeStatusApi,
  UpdateEmployeeStatusResult,
} from '../services/api/employees/types'
import { useToast } from './useToast'

export function toastKeyForDeactivateError(error: unknown): string | null {
  const mapped = toLifecycleError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'LAST_ADMIN') return 'Employees.toast.lastAdmin'
  if (mapped.code === 'FORBIDDEN') return 'Employees.toast.forbidden'
  return mapped.message ? 'Employees.toast.unexpected' : null
}

interface DeactivateEmployeeOptions {
  getActorId: () => string | null
  onStatusChanged: (result: UpdateEmployeeStatusResult) => void
  onSelfDeactivated: (result: UpdateEmployeeStatusResult) => void
}

export function useDeactivateEmployee(
  api: UpdateEmployeeStatusApi,
  options: DeactivateEmployeeOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (id: string) => api.updateStatus({ id, status: 'INACTIVE' }),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      if (result.id === options.getActorId()) {
        options.onSelfDeactivated(result)
        return
      }
      toast.push('success', t('Employees.toast.deactivated'))
      options.onStatusChanged(result)
    },
    onError: (error) => {
      const key = toastKeyForDeactivateError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const deactivate = (id: string) => {
    if (!id || mutation.isPending.value) return
    mutation.mutate(id)
  }

  return {
    deactivate,
    isDeactivating: mutation.isPending,
  }
}
