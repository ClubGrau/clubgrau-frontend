import { api } from '../config'
import type { RequestPasswordResetApi, RequestPasswordResetParams } from './types'

/**
 * `POST /auth/password-reset` (public route).
 *
 * The API answer is always opaque (`{ ok: true }`); it never reveals whether
 * the email exists, is login-capable or is within the cooldown window. We only
 * care that the request resolved without an HTTP error.
 */
export class HttpRequestPasswordResetApi implements RequestPasswordResetApi {
  async requestReset(params: RequestPasswordResetParams): Promise<void> {
    await api.post('/auth/password-reset', { email: params.email })
  }
}

export const httpRequestPasswordResetApi = new HttpRequestPasswordResetApi()
