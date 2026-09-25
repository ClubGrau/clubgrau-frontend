export type EmployeeGenderApi = 'male' | 'female' | 'other'

const LEGACY_GENDER_LABEL_TO_API: Record<string, EmployeeGenderApi> = {
  Masculino: 'male',
  Feminino: 'female',
  Outro: 'other',
  Outros: 'other',
}

/** Maps stored/API or legacy form labels to the canonical enum, or null when unset. */
export function normalizeGenderToApi(
  value: string | null | undefined,
): EmployeeGenderApi | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'Não informado') return null
  if (trimmed === 'male' || trimmed === 'female' || trimmed === 'other') return trimmed
  return LEGACY_GENDER_LABEL_TO_API[trimmed] ?? null
}

/** Value for the gender `<SelectFilter>` (`''` = Não informado). */
export function genderToFormValue(value: string | null | undefined): string {
  return normalizeGenderToApi(value) ?? ''
}

export function genderDisplayKey(api: EmployeeGenderApi): string {
  const keys: Record<EmployeeGenderApi, string> = {
    male: 'Employees.form.genderMale',
    female: 'Employees.form.genderFemale',
    other: 'Employees.form.genderOther',
  }
  return keys[api]
}
