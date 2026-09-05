import { describe, expect, it } from 'vitest'
import { emailIssue, isValidEmail } from './email-value'

describe('isValidEmail', () => {
  it('accepts a simple address', () => {
    expect(isValidEmail('joao@grau.pt')).toBe(true)
    expect(isValidEmail('  joao@grau.pt  ')).toBe(true)
  })

  it('rejects empty, local-only, and domain-without-dot values', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('joao')).toBe(false)
    expect(isValidEmail('joao@grau')).toBe(false)
    expect(isValidEmail('joao @grau.pt')).toBe(false)
  })
})

describe('emailIssue', () => {
  it('returns empty when there is no address', () => {
    expect(emailIssue('')).toBe('empty')
    expect(emailIssue('   ')).toBe('empty')
  })

  it('returns invalid when the shape is wrong', () => {
    expect(emailIssue('joao')).toBe('invalid')
    expect(emailIssue('joao@grau')).toBe('invalid')
  })

  it('returns null when the address can be sent', () => {
    expect(emailIssue('joao@grau.pt')).toBeNull()
  })
})
