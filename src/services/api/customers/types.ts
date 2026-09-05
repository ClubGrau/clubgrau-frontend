import type { Customer, CustomerRank } from '../../../types/customer'
import type { Pagination } from '../../../types/pagination'

export interface GetCustomersParams extends Pagination.PaginationParams {
  search?: string
  rank?: CustomerRank
}

export interface GetCustomersApi {
  getCustomers(
    params: GetCustomersParams,
  ): Promise<Pagination.PaginationResponse<Customer.ListItem>>
}

export interface CreateCustomerParams {
  name: string
  email: string
  phone: string
  nif: string
  referral: string
  rank: CustomerRank | ''
}

export type CreateCustomerResult = { id: string }

export interface CreateCustomerApi {
  create(params: CreateCustomerParams): Promise<CreateCustomerResult>
}

export interface RemoveCustomerParams {
  id: string
}

export type RemoveCustomerResult = { id: string }

export interface RemoveCustomerApi {
  remove(params: RemoveCustomerParams): Promise<RemoveCustomerResult>
}
