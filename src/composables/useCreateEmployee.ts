import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toLifecycleError } from '../domain/lifecycle-error'
import type {
  CreateEmployeeApi,
  CreateEmployeeParams,
  CreateEmployeeResult,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import { useToast } from './useToast'

const CREATE_SUCCESS_MESSAGE = 'Colaborador criado.'
const EMAIL_IN_USE_TOAST = 'Este e-mail já está em uso.'
const VALIDATION_TOAST = 'Não foi possível criar o colaborador. Verifique os dados.'
const FORBIDDEN_TOAST = 'Ação não permitida.'

function omitBlank(value: Employee.CreateCommand): CreateEmployeeParams {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== ''),
  ) as CreateEmployeeParams
}

export function toCreateEmployeeParams(
  payload: Employee.CreateCommand,
): CreateEmployeeParams {
  return omitBlank(payload)
}

export function toastMessageForCreateError(error: unknown): string | null {
  const mapped = toLifecycleError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return FORBIDDEN_TOAST
  if (mapped.code === 'CONFLICT') return EMAIL_IN_USE_TOAST
  if (mapped.code === 'BAD_REQUEST') return VALIDATION_TOAST
  return mapped.message || VALIDATION_TOAST
}

interface CreateEmployeeOptions {
  onCreated: (result: CreateEmployeeResult) => void
}

export function useCreateEmployee(
  api: CreateEmployeeApi,
  options: CreateEmployeeOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (payload: Employee.CreateCommand) =>
      api.create(toCreateEmployeeParams(payload)),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.push('success', CREATE_SUCCESS_MESSAGE)
      options.onCreated(result)
    },
    onError: (error) => {
      const message = toastMessageForCreateError(error)
      if (message) toast.push('error', message)
    },
  })

  const create = (payload: Employee.CreateCommand) => {
    if (mutation.isPending.value) return
    mutation.mutate(payload)
  }

  return {
    create,
    isCreating: mutation.isPending,
  }
}
