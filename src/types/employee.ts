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
  department: string;
  dateHired: string;
  gender: string;
  maritalStatus: string;
  address: string;
  languages: string;
  education: string;
  emergencyContact: string;
  emergencyContactRelation: string;
  employmentId: string;
  employmentType: string;
  jobTitle: string;
  skills: string[];
}

export type EmployeeCreatePayload = Omit<EmployeeShapped, 'id' | 'initials' | 'employmentId'>;

export type EmployeeUpdatePayload = EmployeeCreatePayload;
