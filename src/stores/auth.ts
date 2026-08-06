import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  return { token }
}, {
  persist: {
    pick: ['token'],
    storage: localStorage,
  },
})
