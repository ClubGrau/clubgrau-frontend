import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../i18n'
import { toApiError } from '../domain/api-error'
import { employeeQueryKeys } from '../services/api/employees/query-keys'
import type {
  UpdateEmployeeSectionResult,
  UpdateProfessionalEmployeeDataApi,
  UpdateProfessionalEmployeeDataParams,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import { useToast } from './useToast'

function omitBlank(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === '') return
  return value.trim()
}

export function toUpdateProfessionalEmployeeDataParams(
  payload: Employee.UpdateProfessionalDataCommand,
): UpdateProfessionalEmployeeDataParams {
  return {
    id: payload.id,
    role: payload.role.trim(),
    jobTitle: omitBlank(payload.jobTitle),
    employmentId: omitBlank(payload.employmentId),
  }
}

export function toastKeyForUpdateProfessionalDataError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Employees.toast.forbidden'
  if (mapped.code === 'CONFLICT') return 'Employees.toast.updateConflict'
  return 'Employees.toast.updateValidation'
}

interface UpdateProfessionalEmployeeDataOptions {
  onUpdated: (result: UpdateEmployeeSectionResult) => void
}

export function useUpdateProfessionalEmployeeData(
  api: UpdateProfessionalEmployeeDataApi,
  options: UpdateProfessionalEmployeeDataOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (payload: Employee.UpdateProfessionalDataCommand) =>
      api.updateProfessionalData(toUpdateProfessionalEmployeeDataParams(payload)),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      toast.push('success', t('Employees.toast.professionalDataUpdated'))
      options.onUpdated(result)
    },
    onError: (error) => {
      const key = toastKeyForUpdateProfessionalDataError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const updateProfessional = (payload: Employee.UpdateProfessionalDataCommand) => {
    if (mutation.isPending.value) return
    mutation.mutate(payload)
  }

  return {
    updateProfessional,
    isUpdatingProfessional: mutation.isPending,
  }
}
