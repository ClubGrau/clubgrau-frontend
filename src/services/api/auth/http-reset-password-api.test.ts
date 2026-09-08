import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../config'
import { httpResetPasswordApi } from './http-reset-password-api'

vi.mock('../config', () => ({
  api: {
    post: vi.fn(),
  },
}))

describe('HttpResetPasswordApi', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
  })

  it('posts token and both passwords to /auth/password-reset/complete', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'emp-1' } })

    await httpResetPasswordApi.resetPassword({
      token: 'reset-token',
      password: 'SenhaSegura1!',
      passwordConfirmation: 'SenhaSegura1!',
    })

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.post).toHaveBeenCalledWith('/auth/password-reset/complete', {
      token: 'reset-token',
      password: 'SenhaSegura1!',
      passwordConfirmation: 'SenhaSegura1!',
    })

    const body = vi.mocked(api.post).mock.calls[0]?.[1]
    expect(Object.keys(body as object)).toEqual([
      'token',
      'password',
      'passwordConfirmation',
    ])
  })

  it('propagates the invalid-or-expired link failure', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { status: 400, data: { error: 'Invalid or expired link' } },
    })

    await expect(
      httpResetPasswordApi.resetPassword({
        token: 'stale-token',
        password: 'SenhaSegura1!',
        passwordConfirmation: 'SenhaSegura1!',
      }),
    ).rejects.toMatchObject({
      response: { status: 400, data: { error: 'Invalid or expired link' } },
    })
  })
})
