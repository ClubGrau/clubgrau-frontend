import { describe, expect, it } from 'vitest'
import {
  generateSecurePassword,
  MIN_PASSWORD_LENGTH,
  passwordIssue,
} from './password-value'

describe('passwordIssue', () => {
  it('returns empty when password is blank', () => {
    expect(passwordIssue('   ')).toBe('empty')
  })

  it('returns tooShort when password is shorter than the minimum', () => {
    expect(passwordIssue('1234567')).toBe('tooShort')
  })

  it('returns mismatch when confirmation differs', () => {
    expect(passwordIssue('12345678', '87654321')).toBe('mismatch')
  })

  it('returns null for a valid matching pair', () => {
    expect(passwordIssue('12345678', '12345678')).toBeNull()
  })
})

describe('generateSecurePassword', () => {
  it('generates a password at least as long as the minimum', () => {
    expect(generateSecurePassword().length).toBeGreaterThanOrEqual(MIN_PASSWORD_LENGTH)
  })

  it('respects a custom length', () => {
    expect(generateSecurePassword(20)).toHaveLength(20)
  })
})
