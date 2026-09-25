import type { Employee } from '../../../types/employee'
import type { Pagination } from '../../../types/pagination'
import { api } from '../config'
import { mapApiEmployeesToEmployees } from './map-employee'
import type {
  CreateEmployeeApi,
  CreateEmployeeParams,
  CreateEmployeeResult,
  GetEmployeesApi,
  GetEmployeesParams,
  RemoveEmployeeApi,
  RemoveEmployeeParams,
  RemoveEmployeeResult,
  UpdateEmployeeSectionResult,
  UpdateEmployeeStatusApi,
  UpdateEmployeeStatusParams,
  UpdateEmployeeStatusResult,
  UpdateMainEmployeeDataApi,
  UpdateMainEmployeeDataParams,
  UpdatePersonalEmployeeDataApi,
  UpdatePersonalEmployeeDataParams,
  UpdateProfessionalEmployeeDataApi,
  UpdateProfessionalEmployeeDataParams,
} from './types'

type EmployeesApiPayload = {
  employees: Employee.Entity[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export class HttpEmployeesApi
  implements
    GetEmployeesApi,
    UpdateEmployeeStatusApi,
    RemoveEmployeeApi,
    CreateEmployeeApi,
    UpdateMainEmployeeDataApi,
    UpdatePersonalEmployeeDataApi,
    UpdateProfessionalEmployeeDataApi
{
  async getEmployees(
    params: GetEmployeesParams,
  ): Promise<Pagination.PaginationResponse<Employee.ListItem>> {
    const { data } = await api.get<EmployeesApiPayload>('/api/employees', {
      params,
    })

    return {
      data: mapApiEmployeesToEmployees(data.employees ?? []),
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

  async create(params: CreateEmployeeParams): Promise<CreateEmployeeResult> {
    const { data } = await api.post<CreateEmployeeResult>('/api/employee', params)
    return data
  }

  async updateMainData(
    params: UpdateMainEmployeeDataParams,
  ): Promise<UpdateEmployeeSectionResult> {
    const { id, ...fields } = params
    const body = this.entries(fields)
    const { data } = await api.patch<UpdateEmployeeSectionResult>(
      `/api/employee/${id}/main-data`,
      body,
    )
    return data
  }

  async updatePersonalData(
    params: UpdatePersonalEmployeeDataParams,
  ): Promise<UpdateEmployeeSectionResult> {
    const { id, ...fields } = params
    const body = this.entries(fields)
    const { data } = await api.patch<UpdateEmployeeSectionResult>(
      `/api/employee/${id}/personal-data`,
      body,
    )
    return data
  }

  async updateProfessionalData(
    params: UpdateProfessionalEmployeeDataParams,
  ): Promise<UpdateEmployeeSectionResult> {
    const { id, ...body } = params
    const { data } = await api.patch<UpdateEmployeeSectionResult>(
      `/api/employee/${id}/professional-data`,
      body,
    )
    return data
  }

  private entries(params: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    )
  }
}

export const httpEmployeesApi = new HttpEmployeesApi()
