import type { CustomerWalletSummary } from '../../../domain/customer-wallet'
import type {
  Customer,
  CustomerRank,
  CustomerSortDirection,
  CustomerSortKey,
} from '../../../types/customer'
import type { Pagination } from '../../../types/pagination'

export interface GetCustomersParams extends Pagination.PaginationParams {
  search?: string
  rank?: CustomerRank
  sort?: CustomerSortKey
  direction?: CustomerSortDirection
}

export interface GetCustomersResult
  extends Pagination.PaginationResponse<Customer.ListItem> {
  summary: CustomerWalletSummary
}

export interface GetCustomersApi {
  getCustomers(params: GetCustomersParams): Promise<GetCustomersResult>
}

export interface GetCustomerApi {
  getCustomer(id: string): Promise<Customer.ListItem | null>
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
