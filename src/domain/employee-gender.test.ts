import { describe, expect, it } from 'vitest'
import { genderToFormValue, normalizeGenderToApi } from './employee-gender'

describe('normalizeGenderToApi', () => {
  it('accepts canonical enum values', () => {
    expect(normalizeGenderToApi('male')).toBe('male')
    expect(normalizeGenderToApi('female')).toBe('female')
    expect(normalizeGenderToApi('other')).toBe('other')
  })

  it('maps legacy Portuguese labels from older clients', () => {
    expect(normalizeGenderToApi('Masculino')).toBe('male')
    expect(normalizeGenderToApi('Feminino')).toBe('female')
    expect(normalizeGenderToApi('Outro')).toBe('other')
  })

  it('treats empty and Não informado as null', () => {
    expect(normalizeGenderToApi('')).toBeNull()
    expect(normalizeGenderToApi('Não informado')).toBeNull()
    expect(normalizeGenderToApi(null)).toBeNull()
  })
})

describe('genderToFormValue', () => {
  it('returns empty string when gender is unset', () => {
    expect(genderToFormValue(undefined)).toBe('')
    expect(genderToFormValue('male')).toBe('male')
  })
})
