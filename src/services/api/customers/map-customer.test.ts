import { describe, expect, it } from 'vitest'
import type { Customer } from '../../../types/customer'
import {
  mapApiCustomerToListItem,
  mapCustomerToListItem,
  mapCustomersToListItems,
  type CustomerListApiItem,
} from './map-customer'

function entity(overrides: Partial<Customer.Entity> = {}): Customer.Entity {
  return {
    id: 'cust-1',
    name: 'Marina Albuquerque',
    email: 'marina@nordeng.com.br',
    phone: '(85) 98812-4410',
    nif: '251847963',
    referral: 'Rafael Nunes',
    rank: 'GOLD',
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
      rank: 'GOLD',
      initials: 'MA',
    })
  })
})

function apiItem(overrides: Partial<CustomerListApiItem> = {}): CustomerListApiItem {
  return {
    id: 'cust-1',
    name: 'Marina Albuquerque',
    email: 'marina@nordeng.com.br',
    phone: '(85) 98812-4410',
    nif: '251847963',
    createdAt: '2026-01-14T00:00:00.000Z',
    rank: 'GOLD',
    indication: null,
    ...overrides,
  }
}

describe('mapApiCustomerToListItem', () => {
  it('maps a walk-in with empty contact fields and no referral link', () => {
    expect(
      mapApiCustomerToListItem(
        apiItem({
          phone: null,
          nif: null,
          indication: null,
          rank: 'BRONZE',
        }),
      ),
    ).toMatchObject({
      phone: '',
      nif: '',
      referral: '',
      rank: 'BRONZE',
      initials: 'MA',
      indicationCategoryId: null,
      indicationOriginId: null,
      referralCustomerId: null,
      referredCount: 0,
    })
  })

  it('maps a channel indication to the origin name', () => {
    expect(
      mapApiCustomerToListItem(
        apiItem({
          indication: { categoryId: 'canal', originId: 'origin-1', name: 'Instagram' },
        }),
      ),
    ).toMatchObject({
      referral: 'Instagram',
      indicationCategoryId: 'canal',
      indicationOriginId: 'origin-1',
      referralCustomerId: null,
    })
  })

  it('maps a friend indication to the referrer id and leaves a missing name blank', () => {
    expect(
      mapApiCustomerToListItem(
        apiItem({
          nif: 251847963,
          indication: {
            categoryId: 'amigo',
            referrerCustomerId: 'cust-2',
            name: null,
          },
        }),
      ),
    ).toMatchObject({
      nif: '251847963',
      referral: '',
      indicationCategoryId: 'amigo',
      indicationOriginId: null,
      referralCustomerId: 'cust-2',
      referredCount: 0,
    })
  })

  it('drops an unknown rank', () => {
    expect(mapApiCustomerToListItem(apiItem({ rank: 'PLATINUM' })).rank).toBe('')
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
