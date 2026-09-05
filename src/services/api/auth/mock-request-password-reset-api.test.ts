import { describe, expect, it } from 'vitest'
import {
  MOCK_RESET_FAILURE_EMAIL,
  MockRequestPasswordResetApi,
} from './mock-request-password-reset-api'

describe('MockRequestPasswordResetApi', () => {
  it('resolves for an ordinary email', async () => {
    const api = new MockRequestPasswordResetApi(0)

    await expect(api.requestReset({ email: 'joao@grau.pt' })).resolves.toBeUndefined()
  })

  it('rejects the failure address with a 400 envelope', async () => {
    const api = new MockRequestPasswordResetApi(0)

    await expect(api.requestReset({ email: MOCK_RESET_FAILURE_EMAIL })).rejects.toMatchObject({
      response: {
        status: 400,
        data: { error: 'Unable to send reset link' },
      },
    })
  })
})
