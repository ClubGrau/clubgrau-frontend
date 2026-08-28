import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toLifecycleError } from '../domain/lifecycle-error'
import type {
  EmployeesApi,
  RemoveEmployeeParams,
  RemoveEmployeeResult,
  UpdateEmployeeStatusResult,
} from '../services/api/employees/types'
import { useToast } from './useToast'

const DEACTIVATE_SUCCESS_MESSAGE =
  'Colaborador inativado. Você pode reativá-lo pelo perfil.'
const REACTIVATE_SUCCESS_MESSAGE = 'Colaborador reativado (mesma identidade).'
const REMOVE_SUCCESS_MESSAGE =
  'Saiu da equipe. O email original está livre para um cadastro novo.'
const REMOVE_UNAUTHORIZED_MESSAGE =
  'Não foi possível confirmar a sua identidade. Verifique a palavra-passe.'
const LAST_ADMIN_TOAST =
  'É preciso existir outro Administrador ativo antes desta ação.'
const FORBIDDEN_TOAST = 'Ação não permitida.'

interface ToastOptionChange {
  getActorId: () => string | null
  onStatusChanged: (result: UpdateEmployeeStatusResult) => void
  onSelfDeactivated: (result: UpdateEmployeeStatusResult) => void
  onReactivated: (result: UpdateEmployeeStatusResult) => void
  onRemoved: (result: RemoveEmployeeResult) => void
  onRemoveConflict: (id: string) => void
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

export function toastMessageForRemoveError(error: unknown): string | null {
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

  const removeError = ref<string | null>(null)

  const removeMutation = useMutation({
    mutationFn: (params: RemoveEmployeeParams) => api.remove(params),
    retry: 0,
    onMutate: () => {
      removeError.value = null
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.push('success', REMOVE_SUCCESS_MESSAGE)
      options.onRemoved(result)
    },
    onError: (error, variables) => {
      const mapped = toLifecycleError(error)
      if (mapped.code === 'UNAUTHORIZED') {
        removeError.value = REMOVE_UNAUTHORIZED_MESSAGE
        return
      }

      const message = toastMessageForRemoveError(error)
      if (message) toast.push('error', message)

      if (
        mapped.code === 'NOT_INACTIVE' ||
        mapped.code === 'ALREADY_REMOVED' ||
        mapped.code === 'CONFLICT'
      ) {
        void queryClient.invalidateQueries({ queryKey: ['employees'] })
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
    if (!params.id || !params.password || removeMutation.isPending.value) return
    removeMutation.mutate(params)
  }

  return {
    deactivate,
    isDeactivating: mutation.isPending,
    reactivate,
    isReactivating: reactivateMutation.isPending,
    remove,
    isRemoving: removeMutation.isPending,
    removeError,
  }
}
