import { describe, expect, it } from 'vitest'
import type { Employee } from '../../../types/employee'
import { mapApiEmployeeToEmployee, mapApiEmployeesToEmployees } from './map-employee'

function entity(overrides: Partial<Employee.Entity> = {}): Employee.Entity {
  return {
    id: 'emp-1',
    name: 'João Silva',
    username: 'joaosilva',
    email: 'joao@grau.pt',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('mapApiEmployeeToEmployee', () => {
  it('adds initials from first and last name', () => {
    expect(mapApiEmployeeToEmployee(entity()).initials).toBe('JS')
  })

  it('uses the first two letters of a single name', () => {
    expect(mapApiEmployeeToEmployee(entity({ name: 'Ana' })).initials).toBe('AN')
  })

  it('uses ?? when the name is blank', () => {
    expect(mapApiEmployeeToEmployee(entity({ name: '   ' })).initials).toBe('??')
  })

  it('keeps Entity fields and does not invent profile keys', () => {
    const mapped = mapApiEmployeeToEmployee(entity())

    expect(mapped).toMatchObject({
      id: 'emp-1',
      name: 'João Silva',
      role: 'EMPLOYEE',
      initials: 'JS',
    })
    expect(mapped).not.toHaveProperty('permission')
    expect(mapped.gender).toBeUndefined()
    expect(mapped.jobTitle).toBeUndefined()
  })
})

describe('mapApiEmployeesToEmployees', () => {
  it('maps each entity', () => {
    const mapped = mapApiEmployeesToEmployees([
      entity(),
      entity({ id: 'emp-2', name: 'Maria Costa' }),
    ])

    expect(mapped.map((item) => item.initials)).toEqual(['JS', 'MC'])
  })
})
