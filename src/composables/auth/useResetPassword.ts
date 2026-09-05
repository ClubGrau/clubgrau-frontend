import { useMutation } from '@tanstack/vue-query'
import { t } from '../../i18n'
import { toApiError } from '../../domain/api-error'
import type { PasswordIssue } from '../../domain/password-value'
import type { ResetPasswordApi, ResetPasswordParams } from '../../services/api/auth/types'
import { useToast } from '../useToast'

export function toastKeyForPasswordIssue(issue: PasswordIssue): string {
  if (issue === 'empty') return 'ResetPassword.toast.passwordRequired'
  if (issue === 'tooShort') return 'ResetPassword.toast.passwordTooShort'
  return 'ResetPassword.toast.passwordMismatch'
}

export function toastKeyForResetPasswordError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'BAD_REQUEST') {
    if (mapped.message === 'Reset token expired') {
      return 'ResetPassword.toast.expired'
    }
    return 'ResetPassword.toast.invalid'
  }
  return 'ResetPassword.toast.unexpected'
}

interface ResetPasswordOptions {
  onSuccess?: () => void
}

export function useResetPassword(api: ResetPasswordApi, options: ResetPasswordOptions = {}) {
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (params: ResetPasswordParams) => api.resetPassword(params),
    retry: 0,
    onSuccess: () => {
      toast.push('success', t('ResetPassword.toast.saved'))
      options.onSuccess?.()
    },
    onError: (error) => {
      const key = toastKeyForResetPasswordError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const resetPassword = (params: ResetPasswordParams) => {
    if (mutation.isPending.value) return
    if (!params.token.trim()) return
    mutation.mutate(params)
  }

  return {
    resetPassword,
    isResetting: mutation.isPending,
  }
}
