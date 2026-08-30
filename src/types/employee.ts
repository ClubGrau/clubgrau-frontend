export type EmployeeStatus = 'ACTIVE' | 'VACATION' | 'INACTIVE';

export namespace Employee {
  export interface Entity {
    id: string;
    name: string;
    email: string;
    role: string;
    nif?: string;
    phone?: string;
    status: EmployeeStatus;
    createdAt: string;
    deactivateAt?: string;
  }
}

export interface EmployeeShapped {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  nif: string;
  permission: string;
  status: EmployeeStatus;
  initials: string;
  gender: string;
  address: string;
  languages: string;
  emergencyContact: string;
  employmentId: string;
  jobTitle: string;
  password: string;
  passwordConfirmation: string;
}

export type EmployeeCreatePayload = Omit<EmployeeShapped, 'id' | 'initials'>;

export type EmployeeUpdatePayload = EmployeeCreatePayload;
