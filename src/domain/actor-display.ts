import type { Actor, ActorRole } from '../types/actor'

export const ROLE_LABEL: Record<ActorRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  EMPLOYEE: 'Colaborador',
}

export function actorInitials(name: string | null): string {
  if (!name?.trim()) {
    return '?'
  }

  const tokens = name.trim().split(/\s+/).slice(0, 2)
  return tokens.map((token) => token[0]?.toUpperCase() ?? '').join('')
}

export function canAccessEmployees(actor: Actor | null): boolean {
  return actor?.role === 'MANAGER' || actor?.role === 'ADMIN'
}

/** Login is only for operators without a session. A decodable JWT yields an Actor. */
export function canVisitLogin(actor: Actor | null): boolean {
  return actor === null
}
