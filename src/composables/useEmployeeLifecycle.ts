import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toLifecycleError } from '../domain/lifecycle-error'
import type {
  EmployeesApi,
  UpdateEmployeeStatusResult,
} from '../services/api/employees/types'
import { useToast } from './useToast'

const DEACTIVATE_SUCCESS_MESSAGE =
  'Colaborador inativado. Você pode reativá-lo pelo perfil.'
const LAST_ADMIN_TOAST =
  'É preciso existir outro Administrador ativo antes desta ação.'
const FORBIDDEN_TOAST = 'Ação não permitida.'

interface ToastOptionChange {
  onStatusChanged: (result: UpdateEmployeeStatusResult) => void
}

export function toastMessageForDeactivateError(error: unknown): string | null {
  const mapped = toLifecycleError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'LAST_ADMIN') return LAST_ADMIN_TOAST
  if (mapped.code === 'FORBIDDEN') return FORBIDDEN_TOAST
  return mapped.message || null
}

export function useEmployeeLifecycle(
  api: EmployeesApi,
  options: ToastOptionChange,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (id: string) => api.updateStatus({ id, status: 'INACTIVE' }),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.push('success', DEACTIVATE_SUCCESS_MESSAGE)
      options.onStatusChanged(result)
    },
    onError: (error) => {
      const message = toastMessageForDeactivateError(error)
      if (message) toast.push('error', message)
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
