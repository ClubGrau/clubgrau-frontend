import { reactive } from 'vue'
import type { Account } from '../types/account'
import { useAuthStore } from '../stores/auth'
import { useMutation } from '@tanstack/vue-query'
import type { AuthApi } from '../services/api/auth/types'

export function useLogin(authApi: AuthApi) {
  const authStore = useAuthStore()
  const userCredentials = reactive<Account.ToLogin>({
    email: '',
    password: '',
    remember: false,
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStore.setSession(data)
    },
  })

  function handleSubmit() {
    loginMutation.mutate(userCredentials)
  }

  return {
    userCredentials,
    handleSubmit,
  }
}
