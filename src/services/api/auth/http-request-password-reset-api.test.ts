import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../config'
import { httpRequestPasswordResetApi } from './http-request-password-reset-api'

vi.mock('../config', () => ({
  api: {
    post: vi.fn(),
  },
}))

describe('HttpRequestPasswordResetApi', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
  })

  it('posts the email to /auth/password-reset', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } })

    await httpRequestPasswordResetApi.requestReset({ email: 'op@grau.pt' })

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.post).toHaveBeenCalledWith('/auth/password-reset', {
      email: 'op@grau.pt',
    })
  })

  it('propagates HTTP failures to the caller', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { status: 400, data: { error: 'Missing param: email' } },
    })

    await expect(
      httpRequestPasswordResetApi.requestReset({ email: '' }),
    ).rejects.toMatchObject({
      response: { status: 400, data: { error: 'Missing param: email' } },
    })
  })
})
