import { describe, expect, it } from 'vitest'
import type { Actor, ActorRole } from '../types/actor'
import { canAccessEmployees, canVisitLogin } from './actor-display'

function actor(role: ActorRole | null = 'ADMIN'): Actor {
  return { id: 'actor-1', name: null, role, status: 'ACTIVE' }
}

describe('canVisitLogin', () => {
  it('allows Login when there is no Actor', () => {
    expect(canVisitLogin(null)).toBe(true)
  })

  it('blocks Login when a token yielded an Actor', () => {
    expect(canVisitLogin(actor('ADMIN'))).toBe(false)
    expect(canVisitLogin(actor('MANAGER'))).toBe(false)
    expect(canVisitLogin(actor('EMPLOYEE'))).toBe(false)
    expect(canVisitLogin(actor(null))).toBe(false)
  })
})

describe('canAccessEmployees', () => {
  it('allows MANAGER and ADMIN', () => {
    expect(canAccessEmployees(actor('ADMIN'))).toBe(true)
    expect(canAccessEmployees(actor('MANAGER'))).toBe(true)
  })

  it('hides the screen for EMPLOYEE or no Actor', () => {
    expect(canAccessEmployees(actor('EMPLOYEE'))).toBe(false)
    expect(canAccessEmployees(actor(null))).toBe(false)
    expect(canAccessEmployees(null)).toBe(false)
  })
})
