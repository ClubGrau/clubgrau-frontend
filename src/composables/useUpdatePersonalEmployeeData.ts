import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../i18n'
import { toApiError } from '../domain/api-error'
import { normalizeGenderToApi } from '../domain/employee-gender'
import { hasPhoneNumber } from '../domain/phone-value'
import { employeeQueryKeys } from '../services/api/employees/query-keys'
import type {
  UpdateEmployeeSectionResult,
  UpdatePersonalEmployeeDataApi,
  UpdatePersonalEmployeeDataParams,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import { useToast } from './useToast'

export type PersonalEmployeeDataSnapshot = Pick<
  Employee.Entity,
  'gender' | 'languages' | 'emergencyContact' | 'nif' | 'address'
>

function formText(value: string | null | undefined): string {
  return value ?? ''
}

function nullableText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function nullableEmergencyContact(value: string): string | null {
  if (!hasPhoneNumber(value)) return null
  return value.trim()
}

export function toUpdatePersonalEmployeeDataParams(
  payload: Employee.UpdatePersonalDataCommand,
  original: PersonalEmployeeDataSnapshot,
): UpdatePersonalEmployeeDataParams {
  const params: UpdatePersonalEmployeeDataParams = { id: payload.id }

  const nextGender = normalizeGenderToApi(payload.gender)
  const prevGender = normalizeGenderToApi(original.gender)
  if (nextGender !== prevGender) {
    params.gender = nextGender
  }

  const nextLanguages = nullableText(formText(payload.languages))
  const prevLanguages = nullableText(formText(original.languages))
  if (nextLanguages !== prevLanguages) {
    params.languages = nextLanguages
  }

  const nextEmergency = nullableEmergencyContact(formText(payload.emergencyContact))
  const prevEmergency = nullableEmergencyContact(formText(original.emergencyContact))
  if (nextEmergency !== prevEmergency) {
    params.emergencyContact = nextEmergency
  }

  const nextNif = nullableText(formText(payload.nif))
  const prevNif = nullableText(formText(original.nif))
  if (nextNif !== prevNif) {
    params.nif = nextNif
  }

  const nextAddress = nullableText(formText(payload.address))
  const prevAddress = nullableText(formText(original.address))
  if (nextAddress !== prevAddress) {
    params.address = nextAddress
  }

  return params
}

export function hasPersonalEmployeeDataChanges(
  params: UpdatePersonalEmployeeDataParams,
): boolean {
  return (
    params.gender !== undefined ||
    params.languages !== undefined ||
    params.emergencyContact !== undefined ||
    params.nif !== undefined ||
    params.address !== undefined
  )
}

export function toastKeyForUpdatePersonalDataError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Employees.toast.forbidden'
  if (mapped.code === 'CONFLICT') return 'Employees.toast.updateConflict'
  return 'Employees.toast.updateValidation'
}

export interface UpdatePersonalEmployeeDataInput {
  command: Employee.UpdatePersonalDataCommand
  original: PersonalEmployeeDataSnapshot
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
    mutationFn: (input: UpdatePersonalEmployeeDataInput) =>
      api.updatePersonalData(
        toUpdatePersonalEmployeeDataParams(input.command, input.original),
      ),
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

  const updatePersonal = (input: UpdatePersonalEmployeeDataInput) => {
    if (mutation.isPending.value) return
    const params = toUpdatePersonalEmployeeDataParams(input.command, input.original)
    if (!hasPersonalEmployeeDataChanges(params)) return
    mutation.mutate(input)
  }

  return {
    updatePersonal,
    isUpdatingPersonal: mutation.isPending,
  }
}
