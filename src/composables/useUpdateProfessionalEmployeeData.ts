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

export type ProfessionalEmployeeDataSnapshot = Pick<
  Employee.Entity,
  'jobTitle' | 'role' | 'status'
>

function formText(value: string | null | undefined): string {
  return value ?? ''
}

function nullableText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toUpdateProfessionalEmployeeDataParams(
  payload: Employee.UpdateProfessionalDataCommand,
  original: ProfessionalEmployeeDataSnapshot,
): UpdateProfessionalEmployeeDataParams {
  const params: UpdateProfessionalEmployeeDataParams = { id: payload.id }

  const nextJobTitle = nullableText(formText(payload.jobTitle))
  const prevJobTitle = nullableText(formText(original.jobTitle))
  if (nextJobTitle !== prevJobTitle) {
    params.jobTitle = nextJobTitle
  }

  const nextRole = payload.role.trim()
  if (nextRole !== '' && nextRole !== original.role) {
    params.role = nextRole
  }

  if (payload.status !== original.status) {
    params.status = payload.status
  }

  return params
}

export function hasProfessionalEmployeeDataChanges(
  params: UpdateProfessionalEmployeeDataParams,
): boolean {
  const changes = Object.keys(params).filter((field) => field !== 'id')
  return changes.length > 0
}

export function toastKeyForUpdateProfessionalDataError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Employees.toast.forbidden'
  if (mapped.code === 'LAST_ADMIN') return 'Employees.toast.lastAdmin'
  if (mapped.code === 'CONFLICT' || mapped.code === 'ALREADY_REMOVED') {
    return 'Employees.toast.updateConflict'
  }
  return 'Employees.toast.updateValidation'
}

export interface UpdateProfessionalEmployeeDataInput {
  command: Employee.UpdateProfessionalDataCommand
  original: ProfessionalEmployeeDataSnapshot
}

interface UpdateProfessionalEmployeeDataOptions {
  getActorId: () => string | null
  /** `status` is set only when this save changed the Target status. */
  onUpdated: (
    result: UpdateEmployeeSectionResult,
    status?: UpdateProfessionalEmployeeDataParams['status'],
  ) => void
  onSelfDeactivated: (result: UpdateEmployeeSectionResult) => void
}

export function useUpdateProfessionalEmployeeData(
  api: UpdateProfessionalEmployeeDataApi,
  options: UpdateProfessionalEmployeeDataOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (input: UpdateProfessionalEmployeeDataInput) =>
      api.updateProfessionalData(
        toUpdateProfessionalEmployeeDataParams(input.command, input.original),
      ),
    retry: 0,
    onSuccess: (result, input) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      const params = toUpdateProfessionalEmployeeDataParams(input.command, input.original)
      if (params.status === 'INACTIVE' && result.id === options.getActorId()) {
        options.onSelfDeactivated(result)
        return
      }
      toast.push('success', t('Employees.toast.professionalDataUpdated'))
      options.onUpdated(result, params.status)
    },
    onError: (error) => {
      const key = toastKeyForUpdateProfessionalDataError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const updateProfessional = (input: UpdateProfessionalEmployeeDataInput) => {
    if (mutation.isPending.value) return
    const params = toUpdateProfessionalEmployeeDataParams(input.command, input.original)
    if (!hasProfessionalEmployeeDataChanges(params)) return
    mutation.mutate(input)
  }

  return {
    updateProfessional,
    isUpdatingProfessional: mutation.isPending,
  }
}
