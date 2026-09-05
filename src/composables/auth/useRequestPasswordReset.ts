import { useMutation } from '@tanstack/vue-query'
import { t } from '../../i18n'
import { emailIssue, type EmailIssue } from '../../domain/email-value'
import { toApiError } from '../../domain/api-error'
import type { RequestPasswordResetApi } from '../../services/api/auth/types'
import { useToast } from '../useToast'

export function toastKeyForEmailIssue(issue: EmailIssue): string {
  if (issue === 'empty') return 'ForgotPassword.toast.emailRequired'
  return 'ForgotPassword.toast.emailInvalid'
}

export function toastKeyForRequestPasswordResetError(error: unknown): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'BAD_REQUEST') return 'ForgotPassword.toast.notSent'
  return 'ForgotPassword.toast.unexpected'
}

export function useRequestPasswordReset(api: RequestPasswordResetApi) {
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (email: string) => api.requestReset({ email }),
    retry: 0,
    onSuccess: () => {
      toast.push('success', t('ForgotPassword.toast.sent'))
    },
    onError: (error) => {
      const key = toastKeyForRequestPasswordResetError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const requestReset = (email: string) => {
    if (mutation.isPending.value) return

    const issue = emailIssue(email)
    if (issue) {
      toast.push('error', t(toastKeyForEmailIssue(issue)))
      return
    }

    mutation.mutate(email.trim())
  }

  return {
    requestReset,
    isSending: mutation.isPending,
  }
}
