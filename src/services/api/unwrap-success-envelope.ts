/**
 * Successful API bodies are `{ data }`. An own-data save that includes `name`
 * also returns a sibling `token`. Keep that token on the unwrapped payload.
 * Login stays `{ data: { token } }` and unwraps to `{ token }`.
 */
export function unwrapSuccessEnvelope(body: unknown): unknown {
  if (!body || typeof body !== 'object' || !('data' in body)) {
    return body
  }

  const envelope = body as { data: unknown; token?: unknown }
  const payload = envelope.data

  if (
    typeof envelope.token === 'string' &&
    payload !== null &&
    typeof payload === 'object' &&
    !Array.isArray(payload)
  ) {
    return { ...payload, token: envelope.token }
  }

  return payload ?? body
}
