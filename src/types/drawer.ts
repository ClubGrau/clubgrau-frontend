export type EmployeeDrawerState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'detail'; employeeId: string }
  | { open: true; mode: 'edit'; employeeId: string };
