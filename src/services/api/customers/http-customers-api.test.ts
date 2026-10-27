import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../config'
import { httpCustomersApi } from './http-customers-api'

vi.mock('../config', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('HttpCustomersApi', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
  })

  it('gets a page with search and rank and maps rows to ListItem', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        customers: [
          {
            id: 'cust-1',
            name: 'Maria Silva',
            email: 'maria@example.com',
            phone: null,
            nif: null,
            createdAt: '2026-03-01T00:00:00.000Z',
            rank: 'BRONZE',
            indication: { categoryId: 'canal', originId: 'origin-1', name: 'Instagram' },
          },
        ],
        page: 2,
        limit: 10,
        total: 11,
        totalPages: 2,
      },
    })

    const result = await httpCustomersApi.getCustomers({
      page: 2,
      limit: 10,
      search: ' maria ',
      rank: 'BRONZE',
      sort: 'name',
      direction: 'asc',
    })

    expect(api.get).toHaveBeenCalledWith('/api/customers', {
      params: { page: 2, limit: 10, search: 'maria', rank: 'BRONZE' },
    })
    expect(result).toMatchObject({
      page: 2,
      limit: 10,
      total: 11,
      totalPages: 2,
    })
    expect(result.summary).toBeUndefined()
    expect(result.data[0]).toMatchObject({
      id: 'cust-1',
      initials: 'MS',
      referral: 'Instagram',
      indicationOriginId: 'origin-1',
      referralCustomerId: null,
      referredCount: 0,
      phone: '',
      nif: '',
    })
  })

  it('omits blank search and rank from the query', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { customers: [], page: 1, limit: 10, total: 0, totalPages: 0 },
    })

    await httpCustomersApi.getCustomers({ page: 1, limit: 10, search: '   ' })

    expect(api.get).toHaveBeenCalledWith('/api/customers', {
      params: { page: 1, limit: 10 },
    })
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
