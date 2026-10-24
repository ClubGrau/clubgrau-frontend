import type { CustomerWalletSummary } from '../../../domain/customer-wallet'
import type {
  Customer,
  CustomerIndication,
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

/** Body of POST /api/customer. Rank is not sent. */
export interface CreateCustomerParams {
  name: string
  email: string
  phone: string | null
  nif: number | null
  indication: CustomerIndication | null
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
