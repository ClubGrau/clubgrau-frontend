import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../i18n'
import { toApiError } from '../domain/api-error'
import { employeeQueryKeys } from '../services/api/employees/query-keys'
import type {
  UpdateEmployeeSectionResult,
  UpdatePersonalEmployeeDataApi,
  UpdatePersonalEmployeeDataParams,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import { useToast } from './useToast'

function omitBlank(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === '') return
  return value.trim()
}

export function toUpdatePersonalEmployeeDataParams(
  payload: Employee.UpdatePersonalDataCommand,
): UpdatePersonalEmployeeDataParams {
  return {
    id: payload.id,
    gender: omitBlank(payload.gender),
    languages: omitBlank(payload.languages),
    emergencyContact: omitBlank(payload.emergencyContact),
    nif: omitBlank(payload.nif),
    address: omitBlank(payload.address),
  }
}

export function toastKeyForUpdatePersonalDataError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Employees.toast.forbidden'
  if (mapped.code === 'CONFLICT') return 'Employees.toast.updateConflict'
  return 'Employees.toast.updateValidation'
}

interface UpdatePersonalEmployeeDataOptions {
  onUpdated: (result: UpdateEmployeeSectionResult) => void
}

export function useUpdatePersonalEmployeeData(
  api: UpdatePersonalEmployeeDataApi,
  options: UpdatePersonalEmployeeDataOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (payload: Employee.UpdatePersonalDataCommand) =>
      api.updatePersonalData(toUpdatePersonalEmployeeDataParams(payload)),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      toast.push('success', t('Employees.toast.personalDataUpdated'))
      options.onUpdated(result)
    },
    onError: (error) => {
      const key = toastKeyForUpdatePersonalDataError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const updatePersonal = (payload: Employee.UpdatePersonalDataCommand) => {
    if (mutation.isPending.value) return
    mutation.mutate(payload)
  }

  return {
    updatePersonal,
    isUpdatingPersonal: mutation.isPending,
  }
}
