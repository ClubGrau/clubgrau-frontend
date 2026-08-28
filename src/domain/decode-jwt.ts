import { jwtDecode } from 'jwt-decode'

/** Reads the payload of a JWT. Does not verify the signature — the API does that. */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parsed = jwtDecode<Record<string, unknown>>(token)

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}
