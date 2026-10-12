import { describe, expect, it } from 'vitest'
import type { Indication } from '../types/indication'
import { selectableOrigins, toCustomerIndication } from './customer-indication'

const catalog: Indication.Category[] = [
  {
    id: 'canal',
    name: 'Canal',
    holdsOrigins: true,
    origins: [
      { id: 'canal-active', categoryId: 'canal', name: 'Facebook', active: true },
      { id: 'canal-ended', categoryId: 'canal', name: 'Orkut', active: false },
    ],
  },
  {
    id: 'campanha',
    name: 'Campanha',
    holdsOrigins: true,
    origins: [
      { id: 'campanha-active', categoryId: 'campanha', name: 'Verão', active: true },
    ],
  },
  {
    id: 'amigo',
    name: 'Amigo',
    holdsOrigins: false,
    origins: [],
  },
]

const facebook = catalog[0].origins[0]
const marina = { id: 'cust-1', name: 'Marina Albuquerque' }

describe('selectableOrigins', () => {
  it('returns only active origins of the selected category', () => {
    expect(selectableOrigins(catalog, 'canal').map((origin) => origin.id)).toEqual([
      'canal-active',
    ])
    expect(selectableOrigins(catalog, 'campanha').map((origin) => origin.name)).toEqual([
      'Verão',
    ])
  })
})

describe('toCustomerIndication', () => {
  it('clears the link when the customer was not referred', () => {
    expect(
      toCustomerIndication({
        wasReferred: false,
        categoryId: 'canal',
        origin: facebook,
        friend: marina,
      }),
    ).toEqual({
      wasReferred: false,
      indicationCategoryId: null,
      indicationOriginId: null,
      referral: '',
    })
  })

  it('keeps one active origin and its name', () => {
    expect(
      toCustomerIndication({
        wasReferred: true,
        categoryId: 'canal',
        origin: facebook,
        friend: null,
      }),
    ).toEqual({
      wasReferred: true,
      indicationCategoryId: 'canal',
      indicationOriginId: 'canal-active',
      referral: 'Facebook',
    })
  })

  it('links Amigo to one existing customer and not to a catalog origin', () => {
    expect(
      toCustomerIndication({
        wasReferred: true,
        categoryId: 'amigo',
        origin: facebook,
        friend: marina,
      }),
    ).toEqual({
      wasReferred: true,
      indicationCategoryId: 'amigo',
      indicationOriginId: null,
      referral: 'Marina Albuquerque',
    })
  })

  it('refuses an ended origin, a mismatched category, and Amigo without a customer', () => {
    expect(
      toCustomerIndication({
        wasReferred: true,
        categoryId: 'canal',
        origin: catalog[0].origins[1],
        friend: null,
      }),
    ).toBeNull()
    expect(
      toCustomerIndication({
        wasReferred: true,
        categoryId: 'campanha',
        origin: facebook,
        friend: null,
      }),
    ).toBeNull()
    expect(
      toCustomerIndication({
        wasReferred: true,
        categoryId: 'amigo',
        origin: null,
        friend: null,
      }),
    ).toBeNull()
  })
})
