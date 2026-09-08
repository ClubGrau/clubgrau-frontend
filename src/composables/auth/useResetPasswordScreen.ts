import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { t } from '../../i18n'
import { generateSecurePassword, passwordIssue } from '../../domain/password-value'
import { httpResetPasswordApi } from '../../services/api/auth/http-reset-password-api'
import type { ResetPasswordApi } from '../../services/api/auth/types'
import { useToast } from '../useToast'
import { toastKeyForPasswordIssue, useResetPassword } from './useResetPassword'

export function useResetPasswordScreen(
  token: Ref<string | undefined>,
  api: ResetPasswordApi = httpResetPasswordApi,
) {
  const router = useRouter()
  const toast = useToast()
  const password = ref('')
  const passwordConfirmation = ref('')

  const { resetPassword, isResetting } = useResetPassword(api, {
    onSuccess: () => {
      void router.push('/login')
    },
  })

  const hasToken = computed(() => Boolean(token.value?.trim()))

  function generatePassword() {
    const generated = generateSecurePassword()
    password.value = generated
    passwordConfirmation.value = generated
  }

  function handleSubmit() {
    if (isResetting.value) return

    if (!hasToken.value) {
      toast.push('error', t('ResetPassword.toast.missingToken'))
      return
    }

    const issue = passwordIssue(password.value, passwordConfirmation.value)
    if (issue) {
      toast.push('error', t(toastKeyForPasswordIssue(issue)))
      return
    }

    resetPassword({
      token: token.value!.trim(),
      password: password.value.trim(),
      passwordConfirmation: passwordConfirmation.value.trim(),
    })
  }

  return {
    password,
    passwordConfirmation,
    generatePassword,
    handleSubmit,
    hasToken,
    isResetting,
  }
}
