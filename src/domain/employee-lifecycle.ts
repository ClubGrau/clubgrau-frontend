import type { Actor } from '../types/actor'
import type { EmployeeStatus } from '../types/employee'

export interface LifecycleTarget {
  id: string
  /** `Employee.Entity.role` — the Target's Role. */
  role: string
  status: EmployeeStatus
}

/** Whether the Actor's Role is allowed to act on a Target with this Role. */
function canActOn(actor: Actor | null, targetRole: string): boolean {
  if (!actor) return false
  if (actor.role === 'ADMIN') return true
  if (actor.role === 'MANAGER') return targetRole === 'EMPLOYEE'
  return false
}

export function canDeactivate(actor: Actor | null, target: LifecycleTarget): boolean {
  if (!canActOn(actor, target.role)) return false
  return target.status === 'ACTIVE' || target.status === 'VACATION'
}

export function canReactivate(actor: Actor | null, target: LifecycleTarget): boolean {
  if (!canActOn(actor, target.role)) return false
  return target.status === 'INACTIVE'
}

export function canRemove(actor: Actor | null, target: LifecycleTarget): boolean {
  if (actor?.role !== 'ADMIN') return false
  if (actor.id === target.id) return false
  return target.status === 'INACTIVE'
}

export function canCreate(actor: Actor | null): boolean {
  return actor?.role === 'ADMIN' || actor?.role === 'MANAGER'
}

export function lifecycleActions(actor: Actor | null, target: LifecycleTarget) {
  return {
    canDeactivate: canDeactivate(actor, target),
    canReactivate: canReactivate(actor, target),
    canRemove: canRemove(actor, target),
  }
}
