import type { Actor } from '../types/actor'

/** Only ADMIN and MANAGER may remove a customer from the wallet. */
export function canRemoveCustomer(actor: Actor | null): boolean {
  return actor?.role === 'ADMIN' || actor?.role === 'MANAGER'
}
