import { toApiError } from '../../domain/api-error'

export function toastKeyForIndicationWriteError(
  error: unknown,
  conflictKey = 'Indications.toast.unexpected',
): string | null {
  const mapped = toApiError(error)
  if (mapped.code === 'UNAUTHORIZED') return null
  if (mapped.code === 'FORBIDDEN') return 'Indications.toast.forbidden'
  if (mapped.code === 'CONFLICT') return conflictKey
  if (mapped.code === 'BAD_REQUEST') return 'Indications.toast.invalid'
  return 'Indications.toast.unexpected'
}

export function indicationCatalogErrorKey(error: unknown): string {
  const mapped = toApiError(error)
  if (mapped.code === 'FORBIDDEN') return 'Indications.error.forbidden'
  return 'Indications.error.load'
}
