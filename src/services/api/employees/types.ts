import type { Employee, EmployeeStatus } from '../../../types/employee'
import type { Pagination } from '../../../types/pagination'

/** Status values accepted by GET /api/employees */
export type EmployeeApiStatus = 'ACTIVE' | 'INACTIVE' | 'VACATION'

/** Statuses this feature may send. REMOVED is terminal and VACATION is out of scope. */
export type EmployeeLifecycleStatus = 'ACTIVE' | 'INACTIVE'

export interface GetEmployeesParams extends Pagination.PaginationParams {
  status?: EmployeeApiStatus
  role?: string
  search?: string
}

export interface GetEmployeesApi {
  getEmployees(
    params: GetEmployeesParams,
  ): Promise<Pagination.PaginationResponse<Employee.ListItem>>
}

export interface UpdateEmployeeStatusParams {
  id: string
  status: EmployeeLifecycleStatus
}

export interface UpdateEmployeeStatusResult {
  id: string
  status: EmployeeStatus
}

export interface RemoveEmployeeParams {
  id: string
  password: string
}

export interface RemoveEmployeeResult {
  id: string
}

export interface UpdateEmployeeStatusApi {
  updateStatus(params: UpdateEmployeeStatusParams): Promise<UpdateEmployeeStatusResult>
}

export interface RemoveEmployeeApi {
  remove(params: RemoveEmployeeParams): Promise<RemoveEmployeeResult>
}

export interface CreateEmployeeParams {
  name: string
  username: string
  email: string
  role: string
  password: string
  passwordConfirmation: string
  phone?: string
  nif?: string
  status?: EmployeeApiStatus
  gender?: string
  address?: string
  languages?: string
  emergencyContact?: string
  employmentId?: string
  jobTitle?: string
}

export type CreateEmployeeResult = { id: string }

export interface CreateEmployeeApi {
  create(params: CreateEmployeeParams): Promise<CreateEmployeeResult>
}
