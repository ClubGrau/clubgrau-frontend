export type EmailIssue = 'empty' | 'invalid'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/** Client-side issue for an email field, or null when the value can be sent. */
export function emailIssue(value: string): EmailIssue | null {
  if (!value.trim()) return 'empty'
  if (!isValidEmail(value)) return 'invalid'
  return null
}
