import { defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { decodeJwtPayload } from '../domain/decode-jwt'
import type { Account } from '../types/account'
import type { Actor, ActorRole } from '../types/actor'
import type { EmployeeStatus } from '../types/employee'

function isActorRole(value: unknown): value is ActorRole {
  return value === 'EMPLOYEE' || value === 'MANAGER' || value === 'ADMIN'
}

function actorFromToken(token: string | null): Actor | null {
  if (!token) {
    return null
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    return null
  }

  const { id } = payload
  if (typeof id !== 'string') {
    return null
  }

  return {
    id,
    role: isActorRole(payload.role) ? payload.role : null,
    status: typeof payload.status === 'string' ? (payload.status as EmployeeStatus) : null,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const actor = computed(() => actorFromToken(token.value))

  function setSession(result: Account.LoginResponse) {
    token.value = result.token
  }

  function logout() {
    token.value = null
    localStorage.removeItem('auth')
    void nextTick(() => {
      localStorage.removeItem('auth')
    })
  }

  return { token, actor, setSession, logout }
}, {
  persist: {
    pick: ['token'],
    storage: localStorage,
  },
})
