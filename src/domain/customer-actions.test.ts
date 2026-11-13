import { describe, expect, it } from 'vitest'
import type { Actor } from '../types/actor'
import { canRemoveCustomer } from './customer-actions'

function actor(role: Actor['role']): Actor {
  return {
    id: 'actor-1',
    name: 'Ana',
    email: 'ana@grau.pt',
    role,
    status: 'ACTIVE',
  }
}

describe('canRemoveCustomer', () => {
  it('allows ADMIN and MANAGER to remove customers', () => {
    expect(canRemoveCustomer(actor('ADMIN'))).toBe(true)
    expect(canRemoveCustomer(actor('MANAGER'))).toBe(true)
  })

  it('refuses EMPLOYEE, unknown role, and unauthenticated sessions', () => {
    expect(canRemoveCustomer(actor('EMPLOYEE'))).toBe(false)
    expect(canRemoveCustomer(actor(null))).toBe(false)
    expect(canRemoveCustomer(null)).toBe(false)
  })
})
