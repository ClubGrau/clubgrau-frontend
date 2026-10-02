import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../config'
import { httpOwnEmployeeApi } from './http-own-employee-api'
import type { UpdateOwnEmployeeDataParams } from './types'

vi.mock('../config', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

const employee = {
  id: 'emp-1',
  name: 'João Silva',
  username: 'joao',
  email: 'joao@grau.pt',
  role: 'EMPLOYEE',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  phone: '+351912345678',
  nif: '123456789',
  gender: 'male',
  address: 'Rua do Grau, 10',
  languages: 'Português',
  emergencyContact: '+351910000000',
  employmentId: '1001',
  jobTitle: 'Barbeiro',
}

const body: UpdateOwnEmployeeDataParams = {
  name: 'João Silva',
  phone: '+351912345678',
  username: null,
  gender: null,
  languages: null,
  emergencyContact: null,
  nif: null,
  address: 'Rua B',
}

describe('HttpOwnEmployeeApi', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.patch).mockReset()
  })

  it('maps GET /api/employee/me to a list item and drops any token', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { ...employee, token: 'should-not-leak' },
    })

    const result = await httpOwnEmployeeApi.getOwnEmployee()

    expect(api.get).toHaveBeenCalledWith('/api/employee/me')
    expect(result.initials).toBe('JS')
    expect(result.email).toBe('joao@grau.pt')
    expect(result).not.toHaveProperty('token')
    expect(result).not.toHaveProperty('password')
  })

  it('patches /api/employee/me with only the writable fields', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: employee })

    const result = await httpOwnEmployeeApi.updateOwnEmployeeData(body)

    expect(api.patch).toHaveBeenCalledWith('/api/employee/me', body)
    const sent = vi.mocked(api.patch).mock.calls[0]?.[1] as object
    expect(Object.keys(sent).sort()).toEqual([
      'address',
      'emergencyContact',
      'gender',
      'languages',
      'name',
      'nif',
      'phone',
      'username',
    ])
    expect(sent).not.toHaveProperty('email')
    expect(sent).not.toHaveProperty('actorId')
    expect(sent).not.toHaveProperty('id')
    expect(result.token).toBeUndefined()
    expect(result.employee.id).toBe('emp-1')
    expect(result.employee).not.toHaveProperty('token')
  })

  it('returns the reissued token separately from the read model', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { ...employee, name: 'Maria Silva', token: 'reissued' },
    })

    const result = await httpOwnEmployeeApi.updateOwnEmployeeData({
      ...body,
      name: 'Maria Silva',
    })

    expect(result.token).toBe('reissued')
    expect(result.employee.name).toBe('Maria Silva')
    expect(result.employee).not.toHaveProperty('token')
  })
})
