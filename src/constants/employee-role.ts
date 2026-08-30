import type { SelectFilterOption } from '../types/select-filter'

export const EMPLOYEE_ROLE_OPTIONS: SelectFilterOption[] = [
  { id: 'EMPLOYEE', label: 'Colaborador',   value: 'EMPLOYEE' },
  { id: 'MANAGER',  label: 'Gerente',       value: 'MANAGER'  },
  { id: 'ADMIN',    label: 'Administrador', value: 'ADMIN'    },
]
