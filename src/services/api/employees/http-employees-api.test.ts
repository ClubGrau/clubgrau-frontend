import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../config'
import { httpEmployeesApi } from './http-employees-api'
import type { UpdateEmployeeStatusParams } from './types'

vi.mock('../config', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('HttpEmployeesApi lifecycle commands', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
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

  it('does not accept REMOVED as a sendable status', () => {
    // @ts-expect-error REMOVED is terminal and not a sendable lifecycle status
    const params: UpdateEmployeeStatusParams = { id: 'emp-1', status: 'REMOVED' }
    void params
  })

  it('posts create to /api/employee without actorId', async () => {
    const created = { id: 'emp-new' }
    vi.mocked(api.post).mockResolvedValue({ data: created })

    const body = {
      name: 'João Silva',
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
