import type { SelectFilterOption } from '../types/select-filter'

/** Values accepted by the API (`EmployeeModel.Gender`). */
export type EmployeeGender = 'male' | 'female' | 'other'

export interface EmployeeGenderOption {
  id: string
  labelKey: string
  /** API value. Empty string is the unspecified choice and is not sent as a gender. */
  value: EmployeeGender | ''
  aliases: readonly string[]
}

/** One row per gender. Labels stay in i18n; `value` is what the API stores. */
export const EMPLOYEE_GENDER_OPTIONS: readonly EmployeeGenderOption[] = [
  {
    id: 'female',
    labelKey: 'Employees.form.genderFemale',
    value: 'female',
    aliases: ['famale', 'feminino'],
  },
  {
    id: 'male',
    labelKey: 'Employees.form.genderMale',
    value: 'male',
    aliases: ['masculino'],
  },
  {
    id: 'other',
    labelKey: 'Employees.form.genderOther',
    value: 'other',
    aliases: ['outro'],
  },
  {
    id: 'unspecified',
    labelKey: 'Employees.form.genderUnspecified',
    value: '',
    aliases: ['unspecified', 'não informado', 'nao informado'],
  },
]

function normalized(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? ''
}

function findGender(value: string | null): EmployeeGenderOption | undefined {
  const text = normalized(value)
  if (text === '') return
  return EMPLOYEE_GENDER_OPTIONS.find(
    (option) => option.value === text || option.aliases.includes(text),
  )
}

/** i18n key for a known gender, or null when the value is empty or unknown. */
export function genderLabelKey(value: string | null): string | null {
  return findGender(value)?.labelKey ?? null
}

/** Select value. API and older Portuguese records resolve to `male` | `female` | `other` | ''. */
export function genderOptionValue(value: string | null): EmployeeGender | '' {
  const match = findGender(value)
  return match?.value ?? ''
}

/** Body value for create/update. Unspecified is null so the API can clear the field. */
export function genderApiValue(value: string | null): EmployeeGender | null {
  const option = genderOptionValue(value)
  return option === '' ? null : option
}

export function toGenderSelectOptions(
  labelFor: (labelKey: string) => string,
): SelectFilterOption[] {
  return EMPLOYEE_GENDER_OPTIONS.map((option) => ({
    id: option.id,
    label: labelFor(option.labelKey),
    value: option.value,
  }))
}
