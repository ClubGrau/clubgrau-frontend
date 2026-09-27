import { describe, expect, it } from 'vitest'
import {
  genderApiValue,
  genderLabelKey,
  genderOptionValue,
  toGenderSelectOptions,
} from './employee-gender'

describe('genderLabelKey', () => {
  it('maps API and Portuguese values onto the same label key', () => {
    expect(genderLabelKey('male')).toBe('Employees.form.genderMale')
    expect(genderLabelKey('Masculino')).toBe('Employees.form.genderMale')
    expect(genderLabelKey('female')).toBe('Employees.form.genderFemale')
    expect(genderLabelKey('famale')).toBe('Employees.form.genderFemale')
    expect(genderLabelKey('Feminino')).toBe('Employees.form.genderFemale')
    expect(genderLabelKey('Não informado')).toBe('Employees.form.genderUnspecified')
    expect(genderLabelKey('nao informado')).toBe('Employees.form.genderUnspecified')
  })

  it('returns null when there is nothing to label', () => {
    expect(genderLabelKey(null)).toBeNull()
    expect(genderLabelKey('  ')).toBeNull()
    expect(genderLabelKey('unknown')).toBeNull()
  })
})

describe('genderOptionValue', () => {
  it('normalizes an API or Portuguese value to the select value', () => {
    expect(genderOptionValue('male')).toBe('male')
    expect(genderOptionValue('Masculino')).toBe('male')
    expect(genderOptionValue('FEMALE')).toBe('female')
    expect(genderOptionValue('Não informado')).toBe('')
  })

  it('keeps a blank value empty', () => {
    expect(genderOptionValue(null)).toBe('')
    expect(genderOptionValue('xyz')).toBe('')
  })
})

describe('genderApiValue', () => {
  it('sends the enum the API accepts', () => {
    expect(genderApiValue('Masculino')).toBe('male')
    expect(genderApiValue('female')).toBe('female')
    expect(genderApiValue('Outro')).toBe('other')
  })

  it('sends null when gender is unspecified', () => {
    expect(genderApiValue(null)).toBeNull()
    expect(genderApiValue('')).toBeNull()
    expect(genderApiValue('Não informado')).toBeNull()
  })
})

describe('toGenderSelectOptions', () => {
  it('builds select options from the catalog', () => {
    const options = toGenderSelectOptions((key) => key)
    expect(options.map((option) => option.value)).toEqual(['female', 'male', 'other', ''])
    expect(options[1]).toEqual({
      id: 'male',
      label: 'Employees.form.genderMale',
      value: 'male',
    })
  })
})
