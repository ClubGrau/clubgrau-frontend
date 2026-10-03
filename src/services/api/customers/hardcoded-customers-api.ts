import {
  referralLinks,
  sortCustomers,
  summarizeCustomers,
} from '../../../domain/customer-wallet'
import type { Customer } from '../../../types/customer'
import { mapCustomerToListItem } from './map-customer'
import { seedCustomers } from './seed-customers'
import type {
  CreateCustomerApi,
  CreateCustomerParams,
  CreateCustomerResult,
  GetCustomerApi,
  GetCustomersApi,
  GetCustomersParams,
  GetCustomersResult,
  RemoveCustomerApi,
  RemoveCustomerParams,
  RemoveCustomerResult,
} from './types'

function matchesSearch(customer: Customer.Entity, search: string): boolean {
  const query = search.toLowerCase()
  return (
    customer.name.toLowerCase().includes(query) ||
    customer.nif.toLowerCase().includes(query) ||
    customer.email.toLowerCase().includes(query) ||
    customer.phone.toLowerCase().includes(query)
  )
}

export class HardcodedCustomersApi
  implements GetCustomersApi, GetCustomerApi, CreateCustomerApi, RemoveCustomerApi
{
  private items: Customer.Entity[]

  constructor(items: Customer.Entity[] = seedCustomers()) {
    this.items = items
  }

  async getCustomers(params: GetCustomersParams): Promise<GetCustomersResult> {
    let matched = this.items

    const search = params.search?.trim()
    if (search) {
      matched = matched.filter((customer) => matchesSearch(customer, search))
    }

    const now = new Date()
    const platform = summarizeCustomers(this.items, now)
    const searched = summarizeCustomers(matched, now)
    const summary = {
      total: platform.total,
      joinedThisMonth: platform.joinedThisMonth,
      byRank: searched.byRank,
    }
    let filtered = matched

    if (params.rank) {
      filtered = filtered.filter((customer) => customer.rank === params.rank)
    }

    if (params.sort) {
      filtered = sortCustomers(filtered, params.sort, params.direction ?? 'asc')
    }

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / params.limit) || 1)
    const page = Math.min(Math.max(params.page, 1), totalPages)
    const start = (page - 1) * params.limit
    const slice = filtered.slice(start, start + params.limit)

    return {
      data: this.toListItems(slice),
      page,
      limit: params.limit,
      total,
      totalPages,
      summary,
    }
  }

  async getCustomer(id: string): Promise<Customer.ListItem | null> {
    const entity = this.items.find((customer) => customer.id === id)
    if (!entity) return null
    return this.toListItems([entity])[0] ?? null
  }

  private toListItems(entities: Customer.Entity[]): Customer.ListItem[] {
    const links = referralLinks(this.items)
    return entities.map((entity) => ({
      ...mapCustomerToListItem(entity),
      referralCustomerId: links.get(entity.id)?.referralCustomerId ?? null,
      referredCount: links.get(entity.id)?.referredCount ?? 0,
    }))
  }

  async create(params: CreateCustomerParams): Promise<CreateCustomerResult> {
    const id = `cust-${crypto.randomUUID()}`
    this.items = [
      {
        id,
        name: params.name,
        email: params.email,
        phone: params.phone,
        nif: params.nif,
        referral: params.referral,
        rank: params.rank,
        createdAt: new Date().toISOString(),
      },
      ...this.items,
    ]
    return { id }
  }

  async remove(params: RemoveCustomerParams): Promise<RemoveCustomerResult> {
    this.items = this.items.filter((customer) => customer.id !== params.id)
    return { id: params.id }
  }
}

export const hardcodedCustomersApi = new HardcodedCustomersApi()
