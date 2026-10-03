import { describe, expect, it } from 'vitest'
import {
  formatRegistrationDate,
  joinedSharePercent,
  referralLinks,
  sortCustomers,
  summarizeCustomers,
} from './customer-wallet'

const wallet = [
  {
    id: 'cust-1',
    name: 'Marina Albuquerque',
    referral: 'Rafael Nunes',
    rank: 'OURO' as const,
    createdAt: '2026-01-14T00:00:00.000Z',
  },
  {
    id: 'cust-2',
    name: 'Rafael Nunes',
    referral: '',
    rank: 'PRATA' as const,
    createdAt: '2026-02-03T00:00:00.000Z',
  },
  {
    id: 'cust-3',
    name: 'Camila Prado',
    referral: 'Marina Albuquerque',
    rank: 'BRONZE' as const,
    createdAt: '2026-03-22T00:00:00.000Z',
  },
]

describe('formatRegistrationDate', () => {
  it('renders the calendar date as dd/mm/yyyy', () => {
    expect(formatRegistrationDate('2026-01-14T00:00:00.000Z')).toBe('14/01/2026')
  })
})

describe('summarizeCustomers', () => {
  it('counts the wallet and who joined in the current month', () => {
    expect(summarizeCustomers(wallet, new Date(2026, 2, 22))).toEqual({
      total: 3,
      byRank: { OURO: 1, PRATA: 1, BRONZE: 1 },
      joinedThisMonth: 1,
    })
  })
})

describe('joinedSharePercent', () => {
  it('rounds the share of newcomers against the wallet', () => {
    expect(joinedSharePercent(1, 8)).toBe(13)
    expect(joinedSharePercent(2, 8)).toBe(25)
    expect(joinedSharePercent(0, 8)).toBe(0)
  })

  it('is zero when the wallet is empty', () => {
    expect(joinedSharePercent(0, 0)).toBe(0)
  })
})

describe('referralLinks', () => {
  it('links a referral name to that customer and counts who they indicated', () => {
    const links = referralLinks(wallet)

    expect(links.get('cust-1')).toEqual({
      referralCustomerId: 'cust-2',
      referredCount: 1,
    })
    expect(links.get('cust-2')).toEqual({
      referralCustomerId: null,
      referredCount: 1,
    })
    expect(links.get('cust-3')).toEqual({
      referralCustomerId: 'cust-1',
      referredCount: 0,
    })
  })
})

describe('sortCustomers', () => {
  it('orders by newest registration, name, and rank ladder', () => {
    expect(sortCustomers(wallet, 'createdAt', 'desc').map((item) => item.id)).toEqual([
      'cust-3',
      'cust-2',
      'cust-1',
    ])
    expect(sortCustomers(wallet, 'name', 'asc').map((item) => item.name)).toEqual([
      'Camila Prado',
      'Marina Albuquerque',
      'Rafael Nunes',
    ])
    expect(sortCustomers(wallet, 'rank', 'asc').map((item) => item.rank)).toEqual([
      'OURO',
      'PRATA',
      'BRONZE',
    ])
  })
})
