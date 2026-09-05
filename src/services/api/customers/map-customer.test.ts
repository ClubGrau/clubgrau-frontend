import { describe, expect, it } from 'vitest'
import type { Customer } from '../../../types/customer'
import { mapCustomerToListItem, mapCustomersToListItems } from './map-customer'

function entity(overrides: Partial<Customer.Entity> = {}): Customer.Entity {
  return {
    id: 'cust-1',
    name: 'Marina Albuquerque',
    email: 'marina@nordeng.com.br',
    phone: '(85) 98812-4410',
    nif: '251847963',
    referral: 'Rafael Nunes',
    rank: 'OURO',
    createdAt: '2026-01-14T00:00:00.000Z',
    ...overrides,
  }
}

describe('mapCustomerToListItem', () => {
  it('adds initials from first and last name', () => {
    expect(mapCustomerToListItem(entity()).initials).toBe('MA')
  })

  it('uses the first two letters of a single name', () => {
    expect(mapCustomerToListItem(entity({ name: 'Ana' })).initials).toBe('AN')
  })

  it('uses ?? when the name is blank', () => {
    expect(mapCustomerToListItem(entity({ name: '   ' })).initials).toBe('??')
  })

  it('keeps Entity fields', () => {
    expect(mapCustomerToListItem(entity())).toMatchObject({
      id: 'cust-1',
      name: 'Marina Albuquerque',
      nif: '251847963',
      referral: 'Rafael Nunes',
      rank: 'OURO',
      initials: 'MA',
    })
  })
})

describe('mapCustomersToListItems', () => {
  it('maps each entity', () => {
    const mapped = mapCustomersToListItems([
      entity(),
      entity({ id: 'cust-2', name: 'Rafael Nunes' }),
    ])

    expect(mapped.map((item) => item.initials)).toEqual(['MA', 'RN'])
  })
})
