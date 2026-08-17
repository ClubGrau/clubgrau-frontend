import type { Employee } from '../../../types/employee'
import type { Pagination } from '../../../types/pagination'
import { api } from '../config'
import type { GetEmployeesApi, GetEmployeesParams } from './types'

type EmployeesApiPayload = {
  employees: Employee.Entity[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export class HttpEmployeesApi implements GetEmployeesApi {
  async getEmployees(
    params: GetEmployeesParams,
  ): Promise<Pagination.PaginationResponse<Employee.Entity>> {
    const { data } = await api.get<EmployeesApiPayload>('/api/employees', {
      params,
    })

    return {
      data: data.employees ?? [],
      page: data.page,
      limit: data.limit,
      total: data.total,
      totalPages: data.totalPages,
    }
  }
}

export const httpEmployeesApi = new HttpEmployeesApi()
