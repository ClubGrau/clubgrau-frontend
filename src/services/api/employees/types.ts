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

export interface UpdateMainEmployeeDataParams {
  id: string
  name?: string
  email?: string
  phone?: string
  /** `null` clears username on the server (sparse PATCH). */
  username?: string | null
}

export interface UpdatePersonalEmployeeDataParams {
  id: string
  /** `null` clears gender. Allowed strings are `male`, `female`, and `other`. */
  gender?: string | null
  languages?: string
  emergencyContact?: string
  nif?: string
  address?: string
}

export interface UpdateProfessionalEmployeeDataParams {
  id: string
  role: string
  jobTitle?: string
  employmentId?: string
}

export type UpdateEmployeeSectionResult = { id: string }

export interface UpdateMainEmployeeDataApi {
  updateMainData(
    params: UpdateMainEmployeeDataParams,
  ): Promise<UpdateEmployeeSectionResult>
}

export interface UpdatePersonalEmployeeDataApi {
  updatePersonalData(
    params: UpdatePersonalEmployeeDataParams,
  ): Promise<UpdateEmployeeSectionResult>
}

export interface UpdateProfessionalEmployeeDataApi {
  updateProfessionalData(
    params: UpdateProfessionalEmployeeDataParams,
  ): Promise<UpdateEmployeeSectionResult>
}
