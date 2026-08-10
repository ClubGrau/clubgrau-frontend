import type { EmployeeShapped } from '../../../types/employee'
import type { Employee } from '../../../types/employee'

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Maps backend employee payload to the UI `Employee` shape. */
export function mapApiEmployeeToEmployee(apiEmployee: Employee.Entity): EmployeeShapped {
  return {
    id: apiEmployee.id,
    name: apiEmployee.name,
    username: apiEmployee.email?.split('@')[0] ?? '',
    email: apiEmployee.email,
    phone: apiEmployee.phone ?? '',
    nif: apiEmployee.nif ?? '',
    permission: apiEmployee.role,
    status: apiEmployee.isActive ? 'ativo' : 'inativo',
    initials: buildInitials(apiEmployee.name),
    department: '',
    dateHired: apiEmployee.createdAt,
    gender: '',
    maritalStatus: '',
    address: '',
    languages: '',
    education: '',
    emergencyContact: '',
    emergencyContactRelation: '',
    employmentId: apiEmployee.id,
    employmentType: '',
    jobTitle: apiEmployee.role,
    skills: [],
  }
}

export function mapApiEmployeesToEmployees(apiEmployees: Employee.Entity[]): EmployeeShapped[] {
  return apiEmployees.map(mapApiEmployeeToEmployee)
}
