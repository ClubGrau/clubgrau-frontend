export type StatCardVariant = 'default' | 'danger';

export interface StatCardItem {
  id?: string | number;
  label: string;
  value: string | number;
  description?: string;
  variant?: StatCardVariant;
}
