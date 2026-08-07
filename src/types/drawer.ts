export type EmployeeDrawerState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'detail'; employeeId: number }
  | { open: true; mode: 'edit'; employeeId: number };
