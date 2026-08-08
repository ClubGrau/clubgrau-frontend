export type EmployeeStatus = 'ativo' | 'ferias' | 'inativo';

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
