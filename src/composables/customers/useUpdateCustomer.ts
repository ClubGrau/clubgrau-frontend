import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toApiError } from '../../domain/api-error'
import { hasPhoneNumber, normalizePhoneE164 } from '../../domain/phone-value'
import { t } from '../../i18n'
import { customerQueryKeys } from '../../services/api/customers/query-keys'
import type {
  UpdateCustomerApi,
  UpdateCustomerParams,
  UpdateCustomerResult,
} from '../../services/api/customers/types'
import type { Customer } from '../../types/customer'
import { useToast } from '../useToast'

export type CustomerRegistrationSnapshot = Pick<
  Customer.Entity,
  'name' | 'email' | 'phone' | 'nif'
>

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function normalizeOptionalPhone(value: string | null | undefined): string | null {
  const raw = value ?? ''
  if (!hasPhoneNumber(raw)) return null
  return normalizePhoneE164(raw) || raw.trim()
}

function normalizeOptionalNif(value: string | null | undefined): string | null {
  const digits = (value ?? '').replace(/\s+/g, '')
  return digits === '' ? null : digits
}

export function toUpdateCustomerParams(
  payload: Customer.UpdateCommand,
  original: CustomerRegistrationSnapshot,
): UpdateCustomerParams {
  const params: UpdateCustomerParams = { id: payload.id }

  const name = normalizeName(payload.name)
  if (name !== normalizeName(original.name)) {
    params.name = name
  }

  const email = payload.email.trim()
  if (email.toLowerCase() !== original.email.trim().toLowerCase()) {
    params.email = email
  }

  const phone = normalizeOptionalPhone(payload.phone)
  if (phone !== normalizeOptionalPhone(original.phone)) {
    params.phone = phone
  }

  const nif = normalizeOptionalNif(payload.nif)
  if (nif !== normalizeOptionalNif(original.nif)) {
    params.nif = nif
  }

  return params
}

export function hasCustomerUpdateChanges(params: UpdateCustomerParams): boolean {
  return (
    params.name !== undefined ||
    params.email !== undefined ||
    params.phone !== undefined ||
    params.nif !== undefined
  )
}

export function toastKeyForUpdateCustomerError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Customers.toast.updateForbidden'
  if (mapped.code === 'ALREADY_REMOVED') return 'Customers.toast.alreadyRemoved'
  if (mapped.code === 'CONFLICT') return 'Customers.toast.emailInUse'
  if (mapped.code === 'BAD_REQUEST') return 'Customers.toast.updateValidation'
  return 'Customers.toast.unexpected'
}

export interface UpdateCustomerInput {
  command: Customer.UpdateCommand
  original: CustomerRegistrationSnapshot
}

interface UpdateCustomerOptions {
  onUpdated: (result: UpdateCustomerResult) => void
  onNoChanges?: () => void
  onAlreadyRemoved?: (id: string) => void
  onForbidden?: () => void
}

export function useUpdateCustomer(api: UpdateCustomerApi, options: UpdateCustomerOptions) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (input: UpdateCustomerInput) =>
      api.update(toUpdateCustomerParams(input.command, input.original)),
    retry: 0,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all })
      toast.push('success', t('Customers.toast.updated'))
      options.onUpdated(result)
    },
    onError: (error, variables) => {
      const mapped = toApiError(error)
      const key = toastKeyForUpdateCustomerError(error)
      if (key) toast.push('error', t(key))

      if (mapped.code === 'ALREADY_REMOVED') {
        void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all })
        options.onAlreadyRemoved?.(variables.command.id)
        return
      }

      if (mapped.code === 'FORBIDDEN') {
        options.onForbidden?.()
      }
    },
  })

  const update = (input: UpdateCustomerInput) => {
    if (!input.command.id || mutation.isPending.value) return
    const params = toUpdateCustomerParams(input.command, input.original)
    if (!hasCustomerUpdateChanges(params)) {
      options.onNoChanges?.()
      return
    }
    mutation.mutate(input)
  }

  return {
    update,
    isUpdating: mutation.isPending,
  }
}
