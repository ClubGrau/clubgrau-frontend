import { ref } from 'vue'
import { mockRequestPasswordResetApi } from '../../services/api/auth/mock-request-password-reset-api'
import type { RequestPasswordResetApi } from '../../services/api/auth/types'
import { useRequestPasswordReset } from './useRequestPasswordReset'

export function useForgotPasswordScreen(
  api: RequestPasswordResetApi = mockRequestPasswordResetApi,
) {
  const email = ref('')
  const { requestReset, isSending } = useRequestPasswordReset(api)

  function handleSubmit() {
    requestReset(email.value)
  }

  return {
    email,
    handleSubmit,
    isSending,
  }
}
