import type { EmployeeStatus } from '../types/employee'
import type { StatusBadgeVariant } from '../types/status-badge'

export interface EmployeeStatusBadgeConfig {
  label: string
  variant: StatusBadgeVariant
}

export const employeeStatusBadge: Record<EmployeeStatus, EmployeeStatusBadgeConfig> = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  VACATION: { label: 'Férias', variant: 'warning' },
  INACTIVE: { label: 'Inativo', variant: 'danger' },
}
