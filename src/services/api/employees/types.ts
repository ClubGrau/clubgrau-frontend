import type { Pagination } from "../../../types/pagination";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  nif?: string;
  isActive: boolean;
  createdAt: string;
  deactivateAt?: string;
}


export interface GetEmployeesApi {
  getEmployees(
    params: Pagination.PaginationParams,
  ): Promise<Pagination.PaginationResponse<Employee>>;
}
