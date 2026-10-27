import { api } from '../config'
import { mapApiCustomersToListItems, type CustomerListApiItem } from './map-customer'
import type {
  CreateCustomerApi,
  CreateCustomerParams,
  CreateCustomerResult,
  GetCustomersApi,
  GetCustomersParams,
  GetCustomersResult,
} from './types'

type CustomersListPayload = {
  customers: CustomerListApiItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export class HttpCustomersApi implements GetCustomersApi, CreateCustomerApi {
  async getCustomers(params: GetCustomersParams): Promise<GetCustomersResult> {
    const query: Record<string, string | number> = {
      page: params.page,
      limit: params.limit,
    }

    const search = params.search?.trim()
    if (search) query.search = search
    if (params.rank) query.rank = params.rank

    const { data } = await api.get<CustomersListPayload>('/api/customers', {
      params: query,
    })

    return {
      data: mapApiCustomersToListItems(data.customers ?? []),
      page: data.page,
      limit: data.limit,
      total: data.total,
      totalPages: data.totalPages,
    }
  }

  async create(params: CreateCustomerParams): Promise<CreateCustomerResult> {
    const { data } = await api.post<CreateCustomerResult>('/api/customer', params)
    return data
  }
}

export const httpCustomersApi = new HttpCustomersApi()
