import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../config'
import { httpEmployeesApi } from './http-employees-api'
import type { UpdateEmployeeStatusParams } from './types'

vi.mock('../config', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('HttpEmployeesApi lifecycle commands', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
    vi.mocked(api.get).mockReset()
    vi.mocked(api.patch).mockReset()
  })

  it('posts update-status with exactly id and status', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'emp-1', status: 'INACTIVE' },
    })

    const result = await httpEmployeesApi.updateStatus({
      id: 'emp-1',
      status: 'INACTIVE',
    })

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.post).toHaveBeenCalledWith('/api/employee/update-status', {
      id: 'emp-1',
      status: 'INACTIVE',
    })

    const body = vi.mocked(api.post).mock.calls[0]?.[1]
    expect(Object.keys(body as object)).toEqual(['id', 'status'])
    expect(result).toEqual({ id: 'emp-1', status: 'INACTIVE' })
  })

  it('posts remove with exactly id and password', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'emp-1' },
    })

    const result = await httpEmployeesApi.remove({
      id: 'emp-1',
      password: 'secret',
    })

    expect(api.post).toHaveBeenCalledWith('/api/employee/remove', {
      id: 'emp-1',
      password: 'secret',
    })

    const body = vi.mocked(api.post).mock.calls[0]?.[1]
    expect(Object.keys(body as object)).toEqual(['id', 'password'])
    expect(result).toEqual({ id: 'emp-1' })
  })

  it('maps GET /api/employees to ListItem with initials', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        employees: [
          {
            id: 'emp-1',
            name: 'João Silva',
            username: 'joaosilva',
            email: 'joao@grau.pt',
            role: 'EMPLOYEE',
            status: 'ACTIVE',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    })

    const result = await httpEmployeesApi.getEmployees({ page: 1, limit: 10 })

    expect(api.get).toHaveBeenCalledWith('/api/employees', {
      params: { page: 1, limit: 10 },
    })
    expect(result.data).toEqual([
      {
        id: 'emp-1',
        name: 'João Silva',
        username: 'joaosilva',
        email: 'joao@grau.pt',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
        initials: 'JS',
      },
    ])
    expect(result.total).toBe(1)
  })

  it('does not accept REMOVED as a sendable status', () => {
    // @ts-expect-error REMOVED is terminal and not a sendable lifecycle status
    const params: UpdateEmployeeStatusParams = { id: 'emp-1', status: 'REMOVED' }
    void params
  })

  it('patches main-data with id in the path and sparse body', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'emp-1' } })

    const result = await httpEmployeesApi.updateMainData({
      id: 'emp-1',
      name: 'João Silva',
    })

    expect(api.patch).toHaveBeenCalledWith('/api/employee/emp-1/main-data', {
      name: 'João Silva',
    })

    const body = vi.mocked(api.patch).mock.calls[0]?.[1] as object
    expect(body).not.toHaveProperty('id')
    expect(body).not.toHaveProperty('actorId')
    expect(result).toEqual({ id: 'emp-1' })
  })

  it('patches main-data with null username to clear it', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'emp-1' } })

    await httpEmployeesApi.updateMainData({
      id: 'emp-1',
      username: null,
    })

    expect(api.patch).toHaveBeenCalledWith('/api/employee/emp-1/main-data', {
      username: null,
    })
  })

  it('patches personal-data with id in the path', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'emp-1' } })

    const result = await httpEmployeesApi.updatePersonalData({
      id: 'emp-1',
      gender: 'male',
      languages: 'Português',
      nif: '123456789',
    })

    expect(api.patch).toHaveBeenCalledWith('/api/employee/emp-1/personal-data', {
      gender: 'male',
      languages: 'Português',
      nif: '123456789',
    })
    expect(result).toEqual({ id: 'emp-1' })
  })

  it('patches personal-data with null nif to clear it', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'emp-1' } })

    await httpEmployeesApi.updatePersonalData({
      id: 'emp-1',
      nif: null,
    })

    expect(api.patch).toHaveBeenCalledWith('/api/employee/emp-1/personal-data', {
      nif: null,
    })
  })

  it('patches professional-data with id in the path', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'emp-1' } })

    const result = await httpEmployeesApi.updateProfessionalData({
      id: 'emp-1',
      role: 'EMPLOYEE',
      jobTitle: 'Barbeiro',
      employmentId: 'EMP-001',
    })

    expect(api.patch).toHaveBeenCalledWith('/api/employee/emp-1/professional-data', {
      role: 'EMPLOYEE',
      jobTitle: 'Barbeiro',
      employmentId: 'EMP-001',
    })
    expect(result).toEqual({ id: 'emp-1' })
  })

  it('posts create to /api/employee without actorId', async () => {
    const created = { id: 'emp-new' }
    vi.mocked(api.post).mockResolvedValue({ data: created })

    const body = {
      name: 'João Silva',
      username: 'joaosilva',
      email: 'joao@grau.pt',
      role: 'EMPLOYEE',
      password: 'senhaSegura123',
      passwordConfirmation: 'senhaSegura123',
      phone: '+351912345678',
      nif: '123456789',
      status: 'ACTIVE' as const,
    }

    const result = await httpEmployeesApi.create(body)

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.post).toHaveBeenCalledWith('/api/employee', body)

    const sent = vi.mocked(api.post).mock.calls[0]?.[1] as object
    expect(sent).not.toHaveProperty('actorId')
    expect(sent).not.toHaveProperty('permission')
    expect(result).toEqual(created)
  })
})
