import { describe, expect, it } from 'vitest'
import type { Actor, ActorRole } from '../types/actor'
import type { EmployeeStatus } from '../types/employee'
import {
  canDeactivate,
  canReactivate,
  canRemove,
  type LifecycleTarget,
} from './employee-lifecycle'

function actor(role: ActorRole | null, id = 'actor-1'): Actor {
  return { id, name: null, role, status: 'ACTIVE' }
}

function target(
  role: string,
  status: EmployeeStatus,
  id = 'target-1',
): LifecycleTarget {
  return { id, role, status }
}

const ACTIVE_STATUSES: EmployeeStatus[] = ['ACTIVE', 'VACATION']
const TARGET_ROLES = ['EMPLOYEE', 'MANAGER', 'ADMIN']

describe('employee-lifecycle helper', () => {
  describe('null / EMPLOYEE actor sees nothing', () => {
    for (const actorValue of [null, actor(null), actor('EMPLOYEE')]) {
      for (const role of TARGET_ROLES) {
        it(`actor ${actorValue?.role ?? 'null'} → target ${role}: all false`, () => {
          const active = target(role, 'ACTIVE')
          const inactive = target(role, 'INACTIVE')
          expect(canDeactivate(actorValue, active)).toBe(false)
          expect(canReactivate(actorValue, inactive)).toBe(false)
          expect(canRemove(actorValue, inactive)).toBe(false)
        })
      }
    }
  })

  describe('MANAGER acts only on EMPLOYEE targets', () => {
    it('EMPLOYEE ACTIVE/VACATION → Deactivate, no Remove', () => {
      for (const status of ACTIVE_STATUSES) {
        const t = target('EMPLOYEE', status)
        expect(canDeactivate(actor('MANAGER'), t)).toBe(true)
        expect(canReactivate(actor('MANAGER'), t)).toBe(false)
        expect(canRemove(actor('MANAGER'), t)).toBe(false)
      }
    })

    it('EMPLOYEE INACTIVE → Reactivate, no Remove', () => {
      const t = target('EMPLOYEE', 'INACTIVE')
      expect(canReactivate(actor('MANAGER'), t)).toBe(true)
      expect(canDeactivate(actor('MANAGER'), t)).toBe(false)
      expect(canRemove(actor('MANAGER'), t)).toBe(false)
    })

    it('MANAGER/ADMIN target, any status → nothing', () => {
      for (const role of ['MANAGER', 'ADMIN']) {
        for (const status of ['ACTIVE', 'VACATION', 'INACTIVE'] as EmployeeStatus[]) {
          const t = target(role, status)
          expect(canDeactivate(actor('MANAGER'), t)).toBe(false)
          expect(canReactivate(actor('MANAGER'), t)).toBe(false)
          expect(canRemove(actor('MANAGER'), t)).toBe(false)
        }
      }
    })
  })

  describe('ADMIN acts on any role', () => {
    it('ACTIVE/VACATION → only Deactivate', () => {
      for (const role of TARGET_ROLES) {
        for (const status of ACTIVE_STATUSES) {
          const t = target(role, status)
          expect(canDeactivate(actor('ADMIN'), t)).toBe(true)
          expect(canReactivate(actor('ADMIN'), t)).toBe(false)
          expect(canRemove(actor('ADMIN'), t)).toBe(false)
        }
      }
    })

    it('INACTIVE → Reactivate and Remove, no Deactivate', () => {
      for (const role of TARGET_ROLES) {
        const t = target(role, 'INACTIVE')
        expect(canReactivate(actor('ADMIN'), t)).toBe(true)
        expect(canRemove(actor('ADMIN'), t)).toBe(true)
        expect(canDeactivate(actor('ADMIN'), t)).toBe(false)
      }
    })
  })

  it('never shows Deactivate and Remove at the same time', () => {
    for (const role of TARGET_ROLES) {
      for (const status of ['ACTIVE', 'VACATION', 'INACTIVE'] as EmployeeStatus[]) {
        const t = target(role, status)
        const both = canDeactivate(actor('ADMIN'), t) && canRemove(actor('ADMIN'), t)
        expect(both).toBe(false)
      }
    }
  })

  it('ADMIN cannot Remove their own record', () => {
    const t = target('ADMIN', 'INACTIVE', 'same-id')
    expect(canRemove(actor('ADMIN', 'same-id'), t)).toBe(false)
    expect(canRemove(actor('ADMIN', 'other-id'), t)).toBe(true)
  })

  it('ADMIN self-Deactivate may still show', () => {
    const t = target('ADMIN', 'ACTIVE', 'same-id')
    expect(canDeactivate(actor('ADMIN', 'same-id'), t)).toBe(true)
  })
})
