import { api } from '../config'
import type { CreateCustomerApi, CreateCustomerParams, CreateCustomerResult } from './types'

export class HttpCustomersApi implements CreateCustomerApi {
  async create(params: CreateCustomerParams): Promise<CreateCustomerResult> {
    const { data } = await api.post<CreateCustomerResult>('/api/customer', params)
    return data
  }
}

export const httpCustomersApi = new HttpCustomersApi()
