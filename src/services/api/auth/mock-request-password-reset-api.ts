import type { RequestPasswordResetApi, RequestPasswordResetParams } from './types'

/** Use this address to exercise the error toast. Any other email succeeds. */
export const MOCK_RESET_FAILURE_EMAIL = 'erro@grau.pt'

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

export class MockRequestPasswordResetApi implements RequestPasswordResetApi {
  constructor(private readonly delayMs = NETWORK_DELAY_MS) {}

  async requestReset(params: RequestPasswordResetParams): Promise<void> {
    if (this.delayMs > 0) await delay(this.delayMs)

    const email = params.email.trim().toLowerCase()
    if (email === MOCK_RESET_FAILURE_EMAIL) {
      throw httpError(400, 'Unable to send reset link')
    }
  }
}

export const mockRequestPasswordResetApi = new MockRequestPasswordResetApi()
