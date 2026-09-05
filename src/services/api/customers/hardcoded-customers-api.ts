import type { Customer } from '../../../types/customer'
import type { Pagination } from '../../../types/pagination'
import { mapCustomersToListItems } from './map-customer'
import { seedCustomers } from './seed-customers'
import type {
  CreateCustomerApi,
  CreateCustomerParams,
  CreateCustomerResult,
  GetCustomersApi,
  GetCustomersParams,
  RemoveCustomerApi,
  RemoveCustomerParams,
  RemoveCustomerResult,
} from './types'

function matchesSearch(customer: Customer.Entity, search: string): boolean {
  const query = search.toLowerCase()
  return (
    customer.name.toLowerCase().includes(query) ||
    customer.nif.toLowerCase().includes(query) ||
    customer.email.toLowerCase().includes(query)
  )
}

export class HardcodedCustomersApi
  implements GetCustomersApi, CreateCustomerApi, RemoveCustomerApi
{
  private items: Customer.Entity[]

  constructor(items: Customer.Entity[] = seedCustomers()) {
    this.items = items
  }

  async getCustomers(
    params: GetCustomersParams,
  ): Promise<Pagination.PaginationResponse<Customer.ListItem>> {
    let filtered = this.items

    const search = params.search?.trim()
    if (search) {
      filtered = filtered.filter((customer) => matchesSearch(customer, search))
    }

    if (params.rank) {
      filtered = filtered.filter((customer) => customer.rank === params.rank)
    }

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / params.limit) || 1)
    const page = Math.min(Math.max(params.page, 1), totalPages)
    const start = (page - 1) * params.limit
    const slice = filtered.slice(start, start + params.limit)

    return {
      data: mapCustomersToListItems(slice),
      page,
      limit: params.limit,
      total,
      totalPages,
    }
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
