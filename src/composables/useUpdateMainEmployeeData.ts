import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../i18n'
import { toApiError } from '../domain/api-error'
import { employeeQueryKeys } from '../services/api/employees/query-keys'
import type {
  UpdateEmployeeSectionResult,
  UpdateMainEmployeeDataApi,
  UpdateMainEmployeeDataParams,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import { useToast } from './useToast'

export type MainEmployeeDataSnapshot = Pick<
  Employee.Entity,
  'name' | 'email' | 'phone' | 'username'
>

function formText(value: string | null | undefined): string {
  return value ?? ''
}

function normalizeUsername(value: string): string {
  return value.trim().replace(/^@/, '')
}

export function toUpdateMainEmployeeDataParams(
  payload: Employee.UpdateMainDataCommand,
  original: MainEmployeeDataSnapshot,
): UpdateMainEmployeeDataParams {
  const params: UpdateMainEmployeeDataParams = { id: payload.id }

  const name = payload.name.trim()
  if (name !== original.name.trim()) {
    params.name = name
  }

  const email = payload.email.trim()
  if (email !== original.email.trim()) {
    params.email = email
  }

  const phone = payload.phone.trim()
  if (phone !== formText(original.phone).trim()) {
    params.phone = phone
  }

  const username = normalizeUsername(payload.username)
  const originalUsername = normalizeUsername(formText(original.username))
  if (username !== originalUsername) {
    params.username = username === '' ? null : username
  }

  return params
}

export function hasMainEmployeeDataChanges(params: UpdateMainEmployeeDataParams): boolean {
  return (
    params.name !== undefined ||
    params.email !== undefined ||
    params.phone !== undefined ||
    params.username !== undefined
  )
}

export function toastKeyForUpdateMainDataError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Employees.toast.forbidden'
  if (mapped.code === 'CONFLICT') return 'Employees.toast.emailInUse'
  return 'Employees.toast.updateValidation'
}

export interface UpdateMainEmployeeDataInput {
  command: Employee.UpdateMainDataCommand
  original: MainEmployeeDataSnapshot
}

interface UpdateMainEmployeeDataOptions {
  onUpdated: (result: UpdateEmployeeSectionResult) => void
}

export function useUpdateMainEmployeeData(
  api: UpdateMainEmployeeDataApi,
  options: UpdateMainEmployeeDataOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (input: UpdateMainEmployeeDataInput) =>
      api.updateMainData(toUpdateMainEmployeeDataParams(input.command, input.original)),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      toast.push('success', t('Employees.toast.mainDataUpdated'))
      options.onUpdated(result)
    },
    onError: (error) => {
      const key = toastKeyForUpdateMainDataError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const updateMain = (input: UpdateMainEmployeeDataInput) => {
    if (mutation.isPending.value) return
    const params = toUpdateMainEmployeeDataParams(input.command, input.original)
    if (!hasMainEmployeeDataChanges(params)) return
    mutation.mutate(input)
  }

  return {
    updateMain,
    isUpdatingMain: mutation.isPending,
  }
}
