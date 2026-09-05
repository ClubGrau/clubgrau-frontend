export const MIN_PASSWORD_LENGTH = 8

export type PasswordIssue = 'empty' | 'tooShort' | 'mismatch'

const SECURE_PASSWORD_CHARSET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'

export function passwordIssue(
  password: string,
  confirmation?: string,
): PasswordIssue | null {
  const trimmed = password.trim()
  if (!trimmed) return 'empty'
  if (trimmed.length < MIN_PASSWORD_LENGTH) return 'tooShort'
  if (confirmation !== undefined && trimmed !== confirmation.trim()) {
    return 'mismatch'
  }
  return null
}

export function generateSecurePassword(length = 16): string {
  const size = Math.max(length, MIN_PASSWORD_LENGTH)
  const values = new Uint32Array(size)
  crypto.getRandomValues(values)

  let result = ''
  for (let index = 0; index < size; index += 1) {
    result += SECURE_PASSWORD_CHARSET[values[index]! % SECURE_PASSWORD_CHARSET.length]
  }
  return result
}
