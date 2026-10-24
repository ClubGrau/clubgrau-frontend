import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../config'
import { httpCustomersApi } from './http-customers-api'

vi.mock('../config', () => ({
  api: {
    post: vi.fn(),
  },
}))

describe('HttpCustomersApi', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
  })

  it('posts create with name, email, optional fields and no rank', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: '507f1f77bcf86cd799439011' } })

    const result = await httpCustomersApi.create({
      name: 'Ana Reis',
      email: 'ana@example.com',
      phone: null,
      nif: null,
      indication: null,
    })

    expect(api.post).toHaveBeenCalledWith('/api/customer', {
      name: 'Ana Reis',
      email: 'ana@example.com',
      phone: null,
      nif: null,
      indication: null,
    })
    const body = vi.mocked(api.post).mock.calls[0]?.[1] as Record<string, unknown>
    expect(Object.keys(body)).toEqual(['name', 'email', 'phone', 'nif', 'indication'])
    expect(body).not.toHaveProperty('rank')
    expect(body).not.toHaveProperty('wasReferred')
    expect(result).toEqual({ id: '507f1f77bcf86cd799439011' })
  })

  it('posts a channel indication with only categoryId and originId', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'cust-1' } })

    await httpCustomersApi.create({
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '+351912345678',
      nif: 123456789,
      indication: { categoryId: 'canal', originId: 'origin-1' },
    })

    const body = vi.mocked(api.post).mock.calls[0]?.[1] as {
      indication: Record<string, unknown>
    }
    expect(Object.keys(body.indication)).toEqual(['categoryId', 'originId'])
  })
})
