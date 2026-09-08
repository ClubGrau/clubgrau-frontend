import { api } from '../config'
import type { ResetPasswordApi, ResetPasswordParams } from './types'

/**
 * `POST /auth/password-reset/complete` (public route).
 *
 * On success the API returns `{ id }`; the UI does not need it, so we discard
 * it. On failure the API answers `400 { error }` with one of:
 * `"Invalid or expired link"`, `"Password and passwordConfirmation do not match"`
 * or `"Missing param: <field>"`.
 */
export class HttpResetPasswordApi implements ResetPasswordApi {
  async resetPassword(params: ResetPasswordParams): Promise<void> {
    await api.post('/auth/password-reset/complete', {
      token: params.token,
      password: params.password,
      passwordConfirmation: params.passwordConfirmation,
    })
  }
}

export const httpResetPasswordApi = new HttpResetPasswordApi()
