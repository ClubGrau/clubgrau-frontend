import { describe, expect, it } from 'vitest'
import {
  MOCK_RESET_EXPIRED_TOKEN,
  MOCK_RESET_INVALID_TOKEN,
  MockResetPasswordApi,
} from './mock-reset-password-api'

describe('MockResetPasswordApi', () => {
  const api = new MockResetPasswordApi(0)

  it('resolves for a valid token', async () => {
    await expect(
      api.resetPassword({
        token: 'valid-token',
        password: 'SenhaSegura1!',
        passwordConfirmation: 'SenhaSegura1!',
      }),
    ).resolves.toBeUndefined()
  })

  it('rejects invalid tokens with 400', async () => {
    await expect(
      api.resetPassword({
        token: MOCK_RESET_INVALID_TOKEN,
        password: 'SenhaSegura1!',
        passwordConfirmation: 'SenhaSegura1!',
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { error: 'Invalid reset token' },
      },
    })
  })

  it('rejects expired tokens with 400', async () => {
    await expect(
      api.resetPassword({
        token: MOCK_RESET_EXPIRED_TOKEN,
        password: 'SenhaSegura1!',
        passwordConfirmation: 'SenhaSegura1!',
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { error: 'Reset token expired' },
      },
    })
  })
})
