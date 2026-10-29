import { CUSTOMER_RANK_LADDER, CUSTOMER_RANKS } from '../constants/customer-rank'
import type { IndicationCategoryId } from '../types/indication'
import type {
  CustomerRank,
  CustomerSortDirection,
  CustomerSortKey,
} from '../types/customer'

export interface CustomerIndicationMix {
  canal: number
  campanha: number
  amigo: number
  none: number
}

export interface CustomerWalletSummary {
  total: number
  byRank: Record<CustomerRank, number>
  joinedThisMonth: number
  joinedLastMonth: number
  byIndication: CustomerIndicationMix
}

export interface CustomerWalletRow {
  rank: CustomerRank | ''
  createdAt: string
  indicationCategoryId?: IndicationCategoryId | null
}

function indicationMixTotal(mix: CustomerIndicationMix): number {
  return mix.canal + mix.campanha + mix.amigo + mix.none
}

/**
 * Origin buckets have to add up to the wallet total.
 * Anyone counted in the total and missing from a bucket is shown as no indication.
 */
export function withBalancedIndication(
  summary: CustomerWalletSummary,
): CustomerWalletSummary {
  const counted = indicationMixTotal(summary.byIndication)
  if (counted === 0) return summary
  const gap = summary.total - counted
  if (gap <= 0) return summary
  return {
    ...summary,
    byIndication: {
      ...summary.byIndication,
      none: summary.byIndication.none + gap,
    },
  }
}

export interface CustomerReferralLink {
  referralCustomerId: string | null
  referredCount: number
}

/**
 * Customer type definition
 */
export type Customer = {
  id: string
  name: string
  referral: string
  referralCustomerId?: string | null
}

const RANK_WEIGHT: Record<CustomerRank, number> = {
  GOLD: CUSTOMER_RANK_LADDER.indexOf('GOLD'),
  SILVER: CUSTOMER_RANK_LADDER.indexOf('SILVER'),
  BRONZE: CUSTOMER_RANK_LADDER.indexOf('BRONZE'),
}

function emptyCustomerIndicationMix(): CustomerIndicationMix {
  return { canal: 0, campanha: 0, amigo: 0, none: 0 }
}

export function emptyCustomerWalletSummary(): CustomerWalletSummary {
  return {
    total: 0,
    byRank: { GOLD: 0, SILVER: 0, BRONZE: 0 },
    joinedThisMonth: 0,
    joinedLastMonth: 0,
    byIndication: emptyCustomerIndicationMix(),
  }
}

export function addWalletSummary(
  target: CustomerWalletSummary,
  page: CustomerWalletSummary,
): void {
  target.joinedThisMonth += page.joinedThisMonth
  target.joinedLastMonth += page.joinedLastMonth
  target.byIndication.canal += page.byIndication.canal
  target.byIndication.campanha += page.byIndication.campanha
  target.byIndication.amigo += page.byIndication.amigo
  target.byIndication.none += page.byIndication.none
  for (const rank of CUSTOMER_RANKS) target.byRank[rank] += page.byRank[rank]
}

export function joinedSharePercent(joined: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((joined / total) * 100)
}

export function calendarMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

function previousCalendarMonthKey(date: Date): string {
  return calendarMonthKey(new Date(date.getFullYear(), date.getMonth() - 1, 1))
}

export function formatRegistrationDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-')
  if (!year || !month || !day || year.length !== 4) return iso.slice(0, 10)
  return `${day}/${month}/${year}`
}

export function summarizeCustomers(
  customers: readonly CustomerWalletRow[],
  now: Date,
): CustomerWalletSummary {
  const summary = emptyCustomerWalletSummary()
  const month = calendarMonthKey(now)
  const previousMonth = previousCalendarMonthKey(now)
  summary.total = customers.length

  for (const customer of customers) {
    if (customer.rank) summary.byRank[customer.rank] += 1
    const registeredMonth = customer.createdAt.slice(0, 7)
    if (registeredMonth === month) summary.joinedThisMonth += 1
    else if (registeredMonth === previousMonth) summary.joinedLastMonth += 1

    if ('indicationCategoryId' in customer) {
      const category = customer.indicationCategoryId
      if (category === 'canal' || category === 'campanha' || category === 'amigo') {
        summary.byIndication[category] += 1
      } else {
        summary.byIndication.none += 1
      }
    }
  }

  return summary
}

export function referralLinks(
  customers: readonly Customer[],
): Map<string, CustomerReferralLink> {
  const idByName = new Map<string, string>()
  for (const customer of customers) {
    const name = customer.name.trim().toLowerCase()
    if (name) idByName.set(name, customer.id)
  }

  const referredCount = new Map<string, number>()
  const referralCustomerId = new Map<string, string | null>()

  for (const customer of customers) {
    const storedId = customer.referralCustomerId?.trim() || null
    const referral = customer.referral.trim().toLowerCase()
    const referrerId = storedId ?? (referral ? (idByName.get(referral) ?? null) : null)
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
