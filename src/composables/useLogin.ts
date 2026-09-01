import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Account } from '../types/account'
import { useAuthStore } from '../stores/auth'
import { useMutation } from '@tanstack/vue-query'
import type { AuthApi } from '../services/api/auth/types'
import { toApiError } from '../domain/api-error'

const LOGIN_ERROR_MESSAGE =
  'Não foi possível entrar. Verifique o e-mail e a palavra-passe.'

export function useLogin(authApi: AuthApi) {
  const authStore = useAuthStore()
  const router = useRouter()
  const loginError = ref<string | null>(null)
  const userCredentials = reactive<Account.ToLogin>({
    email: '',
    password: '',
    remember: false,
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStore.setSession(data)
      void router.push('/app')
    },
    onError: (error) => {
      const mapped = toApiError(error)
      if (mapped.code === 'UNAUTHORIZED') {
        loginError.value = LOGIN_ERROR_MESSAGE
      }
    },
  })

  function handleSubmit() {
    loginError.value = null
    loginMutation.mutate(userCredentials)
  }

  return {
    userCredentials,
    handleSubmit,
    loginError,
  }
}
