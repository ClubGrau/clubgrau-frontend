import { ref } from 'vue'
import { httpRequestPasswordResetApi } from '../../services/api/auth/http-request-password-reset-api'
import type { RequestPasswordResetApi } from '../../services/api/auth/types'
import { useRequestPasswordReset } from './useRequestPasswordReset'

export function useForgotPasswordScreen(
  api: RequestPasswordResetApi = httpRequestPasswordResetApi,
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
