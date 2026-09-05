import type { ResetPasswordApi, ResetPasswordParams } from './types'

/** Use this token to exercise the invalid-link toast. */
export const MOCK_RESET_INVALID_TOKEN = 'invalid'

/** Use this token to exercise the expired-link toast. */
export const MOCK_RESET_EXPIRED_TOKEN = 'expired'

const NETWORK_DELAY_MS = 400

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function httpError(status: number, error: string) {
  return {
    response: {
      status,
      data: { error },
    },
  }
}

export class MockResetPasswordApi implements ResetPasswordApi {
  private readonly delayMs: number

  constructor(delayMs = NETWORK_DELAY_MS) {
    this.delayMs = delayMs
  }

  async resetPassword(params: ResetPasswordParams): Promise<void> {
    if (this.delayMs > 0) await delay(this.delayMs)

    const token = params.token.trim()
    if (!token || token === MOCK_RESET_INVALID_TOKEN) {
      throw httpError(400, 'Invalid reset token')
    }
    if (token === MOCK_RESET_EXPIRED_TOKEN) {
      throw httpError(400, 'Reset token expired')
    }
  }
}

export const mockResetPasswordApi = new MockResetPasswordApi()
