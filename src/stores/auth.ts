import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Account } from '../types/account'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)

  function setSession(result: Account.LoginResponse) {
    token.value = result.token
  }

  return { token, setSession }
}, {
  persist: {
    pick: ['token'],
    storage: localStorage,
  },
})
