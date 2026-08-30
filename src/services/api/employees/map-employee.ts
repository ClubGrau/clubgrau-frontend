import type { Employee } from '../../../types/employee'

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Maps backend employee payload to the list/detail row (Entity + initials). */
export function mapApiEmployeeToEmployee(entity: Employee.Entity): Employee.ListItem {
  return {
    ...entity,
    initials: buildInitials(entity.name),
  }
}

export function mapApiEmployeesToEmployees(apiEmployees: Employee.Entity[]): Employee.ListItem[] {
  return apiEmployees.map(mapApiEmployeeToEmployee)
}
