export type StatCardTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface StatCardItem {
  id?: string | number;
  label: string;
  value: string | number;
  description?: string;
  tone?: StatCardTone;
  icon?: string;
}
