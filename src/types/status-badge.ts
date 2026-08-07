export type StatusBadgeVariant = 'success' | 'warning' | 'danger';

export type StatusBadgeSize = 'sm' | 'md';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  size?: StatusBadgeSize;
}
