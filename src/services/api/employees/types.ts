import type { Employee } from "../../../types/employee";
import type { Pagination } from "../../../types/pagination";

export interface GetEmployeesApi {
  getEmployees(
    params: Pagination.PaginationParams,
  ): Promise<Pagination.PaginationResponse<Employee.Entity>>;
}
