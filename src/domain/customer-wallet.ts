import { CUSTOMER_RANK_LADDER } from '../constants/customer-rank'
import type {
  CustomerRank,
  CustomerSortDirection,
  CustomerSortKey,
} from '../types/customer'

export interface CustomerWalletSummary {
  total: number
  byRank: Record<CustomerRank, number>
  joinedThisMonth: number
}

export interface CustomerReferralLink {
  referralCustomerId: string | null
  referredCount: number
}

const RANK_WEIGHT: Record<CustomerRank, number> = {
  OURO: CUSTOMER_RANK_LADDER.indexOf('OURO'),
  PRATA: CUSTOMER_RANK_LADDER.indexOf('PRATA'),
  BRONZE: CUSTOMER_RANK_LADDER.indexOf('BRONZE'),
}

export function emptyCustomerWalletSummary(): CustomerWalletSummary {
  return {
    total: 0,
    byRank: { OURO: 0, PRATA: 0, BRONZE: 0 },
    joinedThisMonth: 0,
  }
}

export function joinedSharePercent(joined: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((joined / total) * 100)
}

export function calendarMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

export function formatRegistrationDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-')
  if (!year || !month || !day || year.length !== 4) return iso.slice(0, 10)
  return `${day}/${month}/${year}`
}

export function summarizeCustomers(
  customers: readonly { rank: CustomerRank | ''; createdAt: string }[],
  now: Date,
): CustomerWalletSummary {
  const summary = emptyCustomerWalletSummary()
  const month = calendarMonthKey(now)
  summary.total = customers.length

  for (const customer of customers) {
    if (customer.rank) summary.byRank[customer.rank] += 1
    if (customer.createdAt.slice(0, 7) === month) summary.joinedThisMonth += 1
  }

  return summary
}

export function referralLinks(
  customers: readonly { id: string; name: string; referral: string }[],
): Map<string, CustomerReferralLink> {
  const idByName = new Map<string, string>()
  for (const customer of customers) {
    const name = customer.name.trim().toLowerCase()
    if (name) idByName.set(name, customer.id)
  }

  const referredCount = new Map<string, number>()
  const referralCustomerId = new Map<string, string | null>()

  for (const customer of customers) {
    const referral = customer.referral.trim().toLowerCase()
    const referrerId = referral ? (idByName.get(referral) ?? null) : null
    const linkedId = referrerId && referrerId !== customer.id ? referrerId : null
    referralCustomerId.set(customer.id, linkedId)
    if (linkedId) {
      referredCount.set(linkedId, (referredCount.get(linkedId) ?? 0) + 1)
    }
  }

  const links = new Map<string, CustomerReferralLink>()
  for (const customer of customers) {
    links.set(customer.id, {
      referralCustomerId: referralCustomerId.get(customer.id) ?? null,
      referredCount: referredCount.get(customer.id) ?? 0,
    })
  }
  return links
}

export function sortCustomers<
  T extends { name: string; rank: CustomerRank | ''; createdAt: string },
>(customers: readonly T[], key: CustomerSortKey, direction: CustomerSortDirection): T[] {
  const factor = direction === 'asc' ? 1 : -1

  return [...customers].sort((left, right) => {
    if (key === 'name') return left.name.localeCompare(right.name, 'pt') * factor
    if (key === 'rank') {
      const leftWeight = left.rank ? RANK_WEIGHT[left.rank] : CUSTOMER_RANK_LADDER.length
      const rightWeight = right.rank ? RANK_WEIGHT[right.rank] : CUSTOMER_RANK_LADDER.length
      return (leftWeight - rightWeight) * factor
    }
    return left.createdAt.localeCompare(right.createdAt) * factor
  })
}
