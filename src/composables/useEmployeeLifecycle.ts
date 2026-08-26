import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toLifecycleError } from '../domain/lifecycle-error'
import type {
  EmployeesApi,
  UpdateEmployeeStatusResult,
} from '../services/api/employees/types'
import { useToast } from './useToast'

const DEACTIVATE_SUCCESS_MESSAGE =
  'Colaborador inativado. Você pode reativá-lo pelo perfil.'
const REACTIVATE_SUCCESS_MESSAGE = 'Colaborador reativado (mesma identidade).'
const LAST_ADMIN_TOAST =
  'É preciso existir outro Administrador ativo antes desta ação.'
const FORBIDDEN_TOAST = 'Ação não permitida.'

interface ToastOptionChange {
  getActorId: () => string | null
  onStatusChanged: (result: UpdateEmployeeStatusResult) => void
  onSelfDeactivated: (result: UpdateEmployeeStatusResult) => void
  onReactivated: (result: UpdateEmployeeStatusResult) => void
}

export function toastMessageForDeactivateError(error: unknown): string | null {
  const mapped = toLifecycleError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'LAST_ADMIN') return LAST_ADMIN_TOAST
  if (mapped.code === 'FORBIDDEN') return FORBIDDEN_TOAST
  return mapped.message || null
}

export function toastMessageForReactivateError(error: unknown): string | null {
  const mapped = toLifecycleError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
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
      if (result.id === options.getActorId()) {
        options.onSelfDeactivated(result)
        return
      }
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

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => api.updateStatus({ id, status: 'ACTIVE' }),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.push('success', REACTIVATE_SUCCESS_MESSAGE)
      options.onReactivated(result)
    },
    onError: (error) => {
      const message = toastMessageForReactivateError(error)
      if (message) toast.push('error', message)
    },
  })

  const reactivate = (id: string) => {
    if (!id || reactivateMutation.isPending.value) return
    reactivateMutation.mutate(id)
  }

  return {
    deactivate,
    isDeactivating: mutation.isPending,
    reactivate,
    isReactivating: reactivateMutation.isPending,
  }
}
