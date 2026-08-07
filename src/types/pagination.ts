import type { SelectFilterOption, SelectFilterPlacement } from './select-filter';

export type PaginationPageItem = number | 'ellipsis';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: SelectFilterOption[];
  pageSizePlacement?: SelectFilterPlacement;
  previousLabel?: string;
  nextLabel?: string;
  showingLabel?: string;
  resultsLabel?: string;
}
