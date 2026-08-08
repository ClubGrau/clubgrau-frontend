export namespace Pagination {
  export interface PaginationParams {
    page: number;
    limit: number;
  }

  export interface PaginationResponse<T> extends PaginationParams {
    data: T[];
    total: number;
    totalPages: number;
  }
}