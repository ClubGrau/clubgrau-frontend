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
