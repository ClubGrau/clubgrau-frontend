import { defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { decodeJwtPayload } from '../domain/decode-jwt'
import type { Account } from '../types/account'
import type { Actor, ActorRole } from '../types/actor'
import type { EmployeeStatus } from '../types/employee'

const ACTOR_ROLES: ActorRole[] = ['EMPLOYEE', 'MANAGER', 'ADMIN']

function isActorRole(value: unknown): value is ActorRole {
  return ACTOR_ROLES.includes(value as ActorRole)
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

  const { name, role, status } = payload

  return {
    id,
    name: name as string | null,
    role: isActorRole(role) ? role : null,
    status: status as EmployeeStatus | null,
  } satisfies Actor
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
