import type { Employee } from '../../../types/employee'
import type { Pagination } from '../../../types/pagination'
import { api } from '../config'
import type {
  GetEmployeesApi,
  GetEmployeesParams,
  RemoveEmployeeApi,
  RemoveEmployeeParams,
  RemoveEmployeeResult,
  UpdateEmployeeStatusApi,
  UpdateEmployeeStatusParams,
  UpdateEmployeeStatusResult,
} from './types'

type EmployeesApiPayload = {
  employees: Employee.Entity[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export class HttpEmployeesApi
  implements GetEmployeesApi, UpdateEmployeeStatusApi, RemoveEmployeeApi
{
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

  async updateStatus(
    params: UpdateEmployeeStatusParams,
  ): Promise<UpdateEmployeeStatusResult> {
    const { data } = await api.post<UpdateEmployeeStatusResult>(
      '/api/employee/update-status',
      {
        id: params.id,
        status: params.status,
      },
    )
    return data
  }

  async remove(params: RemoveEmployeeParams): Promise<RemoveEmployeeResult> {
    const { data } = await api.post<RemoveEmployeeResult>('/api/employee/remove', {
      id: params.id,
      password: params.password,
    })
    return data
  }
}

export const httpEmployeesApi = new HttpEmployeesApi()
