import { describe, expect, it } from 'vitest'
import type { Indication } from '../types/indication'
import { selectableOrigins, toCustomerIndication } from './customer-indication'

const origins: Indication.LinkableOrigin[] = [
  { id: 'canal-active', categoryId: 'canal', name: 'Facebook' },
  { id: 'campanha-active', categoryId: 'campanha', name: 'Verão' },
]

const facebook = origins[0]
const marina = { id: 'cust-1', name: 'Marina Albuquerque' }

describe('selectableOrigins', () => {
  it('keeps the linkable read order inside the selected category', () => {
    expect(selectableOrigins(origins, 'canal').map((origin) => origin.id)).toEqual([
      'canal-active',
    ])
    expect(selectableOrigins(origins, 'campanha').map((origin) => origin.name)).toEqual([
      'Verão',
    ])
  })
})

describe('toCustomerIndication', () => {
  it('sends no indication when the customer was not referred', () => {
    expect(
      toCustomerIndication({
        wasReferred: false,
        categoryId: 'canal',
        origin: facebook,
        friend: marina,
      }),
    ).toEqual({ indication: null })
  })

  it('links one origin and leaves the friend id out', () => {
    expect(
      toCustomerIndication({
        wasReferred: true,
        categoryId: 'canal',
        origin: facebook,
        friend: null,
      }),
    ).toEqual({
      indication: { categoryId: 'canal', originId: 'canal-active' },
    })
  })

  it('links Amigo to one existing customer and not to an origin', () => {
    expect(
      toCustomerIndication({
        wasReferred: true,
        categoryId: 'amigo',
        origin: facebook,
        friend: marina,
      }),
    ).toEqual({
      indication: { categoryId: 'amigo', referrerCustomerId: 'cust-1' },
    })
  })

  it('refuses a mismatched category and Amigo without a customer', () => {
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
    expect(
      toCustomerIndication({
        wasReferred: true,
        categoryId: 'amigo',
        origin: null,
        friend: { id: '', name: 'Marina Albuquerque' },
      }),
    ).toBeNull()
  })
})
