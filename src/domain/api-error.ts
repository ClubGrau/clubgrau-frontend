export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'LAST_ADMIN'
  | 'NOT_INACTIVE'
  | 'ALREADY_REMOVED'
  | 'CONFLICT'
  | 'UNKNOWN'

export interface ApiError {
  code: ApiErrorCode
  /** Raw English `error` string from the API, for diagnostics only. Never show this. */
  message: string
}

const CONFLICT_CODES: Record<string, ApiErrorCode> = {
  'Last Admin must stay ACTIVE until another Admin exists': 'LAST_ADMIN',
  'Employee is not inactive': 'NOT_INACTIVE',
  'Employee is already removed': 'ALREADY_REMOVED',
}

const STATUS_CODES: Record<number, ApiErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readHttpFailure(error: unknown): { status: number; message: string } | null {
  if (!isRecord(error) || !isRecord(error.response)) {
    return null
  }

  const status = error.response.status
  if (typeof status !== 'number') {
    return null
  }

  const data = error.response.data
  const message =
    isRecord(data) && typeof data.error === 'string' ? data.error : ''

  return { status, message }
}

/** Maps an HTTP (or network) failure onto an API error the UI can branch on. */
export function toApiError(error: unknown): ApiError {
  const failure = readHttpFailure(error)
  if (!failure) {
    return { code: 'UNKNOWN', message: '' }
  }

  if (failure.status === 409) {
    return {
      code: CONFLICT_CODES[failure.message] ?? 'CONFLICT',
      message: failure.message,
    }
  }

  const code = STATUS_CODES[failure.status]
  if (!code) {
    return { code: 'UNKNOWN', message: failure.message }
  }

  return { code, message: failure.message }
}
