import { isCustomerRank } from '../../../constants/customer-rank'
import type { Customer } from '../../../types/customer'
import type { IndicationCategoryId } from '../../../types/indication'

/** One row of GET /api/customers, after the success envelope is unwrapped. */
export type CustomerListApiItem = {
  id: string
  name: string
  email: string
  phone: string | null
  nif: string | number | null
  createdAt: string
  rank: string
  indication: CustomerListApiIndication | null
}

export type CustomerListApiIndication =
  | {
      categoryId: 'canal' | 'campanha'
      originId: string
      name: string | null
    }
  | {
      categoryId: 'amigo'
      referrerCustomerId: string
      name: string | null
    }

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function mapCustomerToListItem(
  entity: Customer.Entity,
): Omit<Customer.ListItem, 'referralCustomerId' | 'referredCount'> {
  return {
    ...entity,
    initials: buildInitials(entity.name),
  }
}

export function mapCustomersToListItems(
  entities: Customer.Entity[],
): Omit<Customer.ListItem, 'referralCustomerId' | 'referredCount'>[] {
  return entities.map(mapCustomerToListItem)
}

function displayText(value: string | number | null | undefined): string {
  if (value == null) return ''
  return String(value).trim()
}

function indicationFields(indication: CustomerListApiIndication | null): {
  referral: string
  indicationCategoryId: IndicationCategoryId | null
  indicationOriginId: string | null
  referralCustomerId: string | null
} {
  if (!indication) {
    return {
      referral: '',
      indicationCategoryId: null,
      indicationOriginId: null,
      referralCustomerId: null,
    }
  }

  if (indication.categoryId === 'amigo') {
    return {
      referral: displayText(indication.name),
      indicationCategoryId: 'amigo',
      indicationOriginId: null,
      referralCustomerId: indication.referrerCustomerId,
    }
  }

  return {
    referral: displayText(indication.name),
    indicationCategoryId: indication.categoryId,
    indicationOriginId: indication.originId,
    referralCustomerId: null,
  }
}

/** Maps a GET /api/customers row onto the table row. Referred counts are not in this read. */
export function mapApiCustomerToListItem(item: CustomerListApiItem): Customer.ListItem {
  const indication = indicationFields(item.indication)

  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: displayText(item.phone),
    nif: displayText(item.nif),
    referral: indication.referral,
    rank: isCustomerRank(item.rank) ? item.rank : '',
    createdAt: item.createdAt,
    indicationCategoryId: indication.indicationCategoryId,
    indicationOriginId: indication.indicationOriginId,
    initials: buildInitials(item.name),
    referralCustomerId: indication.referralCustomerId,
    referredCount: 0,
  }
}

export function mapApiCustomersToListItems(items: CustomerListApiItem[]): Customer.ListItem[] {
  return items.map(mapApiCustomerToListItem)
}
