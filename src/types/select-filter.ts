export type SelectFilterValue = string | number;

export type SelectFilterVariant = 'pill' | 'compact' | 'field';

export type SelectFilterPlacement = 'bottom' | 'left' | 'right' | 'top';

export interface SelectFilterOption {
  id?: string | number;
  label: string;
  value: SelectFilterValue;
  disabled?: boolean;
}
