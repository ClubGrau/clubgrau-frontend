import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../config'
import { httpIndicationsApi } from './http-indications-api'

vi.mock('../config', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('HttpIndicationsApi', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
    vi.mocked(api.patch).mockReset()
  })

  it('maps GET /api/indication-catalog to the catalog', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        categories: [
          { id: 'canal', name: 'Canal', holdsOrigins: true, origins: [] },
          { id: 'campanha', name: 'Campanha', holdsOrigins: true, origins: [] },
          { id: 'amigo', name: 'Amigo', holdsOrigins: false, origins: [] },
        ],
      },
    })

    await expect(httpIndicationsApi.getCatalog()).resolves.toEqual({
      categories: [
        { id: 'canal', name: 'Canal', holdsOrigins: true, origins: [] },
        { id: 'campanha', name: 'Campanha', holdsOrigins: true, origins: [] },
        { id: 'amigo', name: 'Amigo', holdsOrigins: false, origins: [] },
      ],
    })
    expect(api.get).toHaveBeenCalledWith('/api/indication-catalog')
  })

  it('maps GET /api/indication-linkable-origins to id, category and name', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        origins: [
          { id: 'canal-1', categoryId: 'canal', name: 'Instagram' },
          { id: 'campanha-1', categoryId: 'campanha', name: 'Verão', active: false },
        ],
      },
    })

    await expect(httpIndicationsApi.getLinkableOrigins()).resolves.toEqual([
      { id: 'canal-1', categoryId: 'canal', name: 'Instagram' },
      { id: 'campanha-1', categoryId: 'campanha', name: 'Verão' },
    ])
    expect(api.get).toHaveBeenCalledWith('/api/indication-linkable-origins')
  })

  it('posts create with exactly categoryId and name', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'origin-1' } })

    const result = await httpIndicationsApi.create({
      categoryId: 'canal',
      name: 'Facebook',
    })

    expect(api.post).toHaveBeenCalledWith('/api/indication-origin', {
      categoryId: 'canal',
      name: 'Facebook',
    })
    const body = vi.mocked(api.post).mock.calls[0]?.[1]
    expect(Object.keys(body as object)).toEqual(['categoryId', 'name'])
    expect(result).toEqual({ id: 'origin-1' })
  })

  it('patches the name and leaves the id on the path', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'origin-1' } })

    const result = await httpIndicationsApi.correctName({
      id: 'origin-1',
      name: 'Instagram Ads',
    })

    expect(api.patch).toHaveBeenCalledWith('/api/indication-origin/origin-1', {
      name: 'Instagram Ads',
    })
    expect(result).toEqual({ id: 'origin-1' })
  })

  it('posts end and reopen with no body', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'origin-1' } })

    await httpIndicationsApi.end({ id: 'origin-1' })
    await httpIndicationsApi.reopen({ id: 'origin-1' })

    expect(api.post).toHaveBeenNthCalledWith(1, '/api/indication-origin/origin-1/end')
    expect(api.post).toHaveBeenNthCalledWith(2, '/api/indication-origin/origin-1/reopen')
  })
})
