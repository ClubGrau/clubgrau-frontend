import type { SelectFilterOption, SelectFilterPlacement } from './select-filter';

export type DataTableAlign = 'left' | 'right';

export type DataTableAriaSort = 'ascending' | 'descending' | 'none';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: DataTableAlign;
  ariaSort?: DataTableAriaSort;
  stopsRowClick?: boolean;
  actionsTrigger?: boolean;
}

/** Offset pagination rendered by DataTable. The parent owns page and page size. */
export interface DataTablePagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: SelectFilterOption[];
  pageSizePlacement?: SelectFilterPlacement;
  previousLabel?: string;
  nextLabel?: string;
  showingLabel?: string;
  resultsLabel?: string;
  ofLabel?: string;
  summaryMode?: 'size' | 'range';
}
