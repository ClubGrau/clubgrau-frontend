import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../../i18n'
import { genderApiValue } from '../../constants/employee-gender'
import { toApiError } from '../../domain/api-error'
import { employeeQueryKeys, ownEmployeeQueryKeys } from '../../services/api/employees/query-keys'
import type {
  UpdateOwnEmployeeDataApi,
  UpdateOwnEmployeeDataParams,
  UpdateOwnEmployeeDataResult,
} from '../../services/api/employees/types'
import type { Employee } from '../../types/employee'
import { useToast } from '../useToast'

function blankToNull(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function normalizeUsername(value: string | undefined): string | null {
  return blankToNull(value?.trim().replace(/^@/, ''))
}

export function toUpdateOwnEmployeeDataParams(
  payload: Employee.UpdateOwnDataCommand,
): UpdateOwnEmployeeDataParams {
  return {
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    username: normalizeUsername(payload.username),
    gender: genderApiValue(payload.gender ?? null),
    languages: blankToNull(payload.languages),
    emergencyContact: blankToNull(payload.emergencyContact),
    nif: blankToNull(payload.nif),
    address: blankToNull(payload.address),
  }
}

export function toastKeyForUpdateOwnEmployeeDataError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'BAD_REQUEST') return 'ProfileCard.toast.validation'
  return 'ProfileCard.toast.unexpected'
}

interface UpdateOwnEmployeeDataOptions {
  onUpdated: (result: UpdateOwnEmployeeDataResult) => void
  onUnauthorized: () => void
}

export function useUpdateOwnEmployeeData(
  api: UpdateOwnEmployeeDataApi,
  options: UpdateOwnEmployeeDataOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (payload: Employee.UpdateOwnDataCommand) =>
      api.updateOwnEmployeeData(toUpdateOwnEmployeeDataParams(payload)),
    retry: 0,
    onSuccess: (result) => {
      queryClient.setQueryData(ownEmployeeQueryKeys.me, result.employee)
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
      toast.push('success', t('ProfileCard.toast.updated'))
      options.onUpdated(result)
    },
    onError: (error) => {
      if (toApiError(error).code === 'UNAUTHORIZED') {
        options.onUnauthorized()
        return
      }

      const key = toastKeyForUpdateOwnEmployeeDataError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const updateOwnEmployeeData = (payload: Employee.UpdateOwnDataCommand) => {
    if (mutation.isPending.value) return
    mutation.mutate(payload)
  }

  return {
    updateOwnEmployeeData,
    isUpdating: mutation.isPending,
  }
}
