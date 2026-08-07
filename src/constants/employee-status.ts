import type { EmployeeStatus } from '../types/employee';
import type { StatusBadgeVariant } from '../types/status-badge';

export interface EmployeeStatusBadgeConfig {
  label: string;
  variant: StatusBadgeVariant;
}

export const employeeStatusBadge: Record<EmployeeStatus, EmployeeStatusBadgeConfig> = {
  ativo: { label: 'Ativo', variant: 'success' },
  ferias: { label: 'Férias', variant: 'warning' },
  inativo: { label: 'Inativo', variant: 'danger' },
};
