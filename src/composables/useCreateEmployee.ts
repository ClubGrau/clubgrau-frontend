import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../i18n'
import { toApiError } from '../domain/api-error'
import { employeeQueryKeys } from '../services/api/employees/query-keys'
import type {
  CreateEmployeeApi,
  CreateEmployeeParams,
  CreateEmployeeResult,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import { useToast } from './useToast'

function omitBlank(value: string | undefined): string | undefined {
  if (value === undefined || value === '') return
  return value
}

export function toCreateEmployeeParams(
  payload: Employee.CreateCommand,
): CreateEmployeeParams {
  return {
    name: payload.name,
    username: payload.username,
    email: payload.email,
    role: payload.role,
    password: payload.password,
    passwordConfirmation: payload.passwordConfirmation,
    phone: omitBlank(payload.phone),
    nif: omitBlank(payload.nif),
    status: payload.status,
    gender: omitBlank(payload.gender),
    address: omitBlank(payload.address),
    languages: omitBlank(payload.languages),
    emergencyContact: omitBlank(payload.emergencyContact),
    employmentId: omitBlank(payload.employmentId),
    jobTitle: omitBlank(payload.jobTitle),
  }
}

export function toastKeyForCreateError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Employees.toast.forbidden'
  if (mapped.code === 'CONFLICT') return 'Employees.toast.emailInUse'
  return 'Employees.toast.createValidation'
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
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      toast.push('success', t('Employees.toast.created'))
      options.onCreated(result)
    },
    onError: (error) => {
      const key = toastKeyForCreateError(error)
      if (key) toast.push('error', t(key))
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
