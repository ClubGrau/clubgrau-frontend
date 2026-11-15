import type { Actor } from '../types/actor'

/** Any authenticated collaborator (ADMIN, MANAGER, EMPLOYEE) may update a customer. */
export function canUpdateCustomer(actor: Actor | null): boolean {
  return (
    actor?.role === 'ADMIN' ||
    actor?.role === 'MANAGER' ||
    actor?.role === 'EMPLOYEE'
  )
}

/** Only ADMIN and MANAGER may remove a customer from the wallet. */
export function canRemoveCustomer(actor: Actor | null): boolean {
  return actor?.role === 'ADMIN' || actor?.role === 'MANAGER'
}
