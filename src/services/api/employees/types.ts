import type { Employee } from '../../../types/employee'
import type { Pagination } from '../../../types/pagination'

/** Status values accepted by GET /api/employees */
export type EmployeeApiStatus = 'ACTIVE' | 'INACTIVE' | 'VACATION'

export interface GetEmployeesParams extends Pagination.PaginationParams {
  status?: EmployeeApiStatus
  role?: string
  search?: string
}

export interface GetEmployeesApi {
  getEmployees(
    params: GetEmployeesParams,
  ): Promise<Pagination.PaginationResponse<Employee.Entity>>
}
