const MIN_LENGTH = 2
const MAX_LENGTH = 100

export type IndicationOriginNameIssue = 'short' | 'long'

/** Trim, then collapse repeated spaces. Same ruler the API applies to a person name. */
export function normalizeIndicationOriginName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function indicationOriginNameIssue(value: string): IndicationOriginNameIssue | null {
  const name = normalizeIndicationOriginName(value)
  if (name.length < MIN_LENGTH) return 'short'
  if (name.length > MAX_LENGTH) return 'long'
  return null
}
