import { describe, expect, it } from 'vitest'
import en from '../i18n/locales/en.json'
import pt from '../i18n/locales/pt.json'
import { toApiError, type ApiError, type ApiErrorCode } from './api-error'

function httpError(status: number, error?: string) {
  return {
    response: {
      status,
      data: error === undefined ? {} : { error },
    },
  }
}

const API_ERROR_CODES = {
  BAD_REQUEST: true,
  UNAUTHORIZED: true,
  FORBIDDEN: true,
  LAST_ADMIN: true,
  NOT_INACTIVE: true,
  ALREADY_REMOVED: true,
  CONFLICT: true,
  UNKNOWN: true,
} as const satisfies Record<ApiErrorCode, true>

function makeApiError(code: number, message: string): ApiError {
  return toApiError(httpError(code, message))
}

describe('toApiError', () => {
  it('maps 400 to BAD_REQUEST', () => {
    const error = makeApiError(400, 'Invalid payload')
    expect(error).toEqual({
      code: 'BAD_REQUEST',
      message: 'Invalid payload',
    })
  })

  it('maps 401 to UNAUTHORIZED', () => {
    const error = makeApiError(401, 'Authentication failed')
    expect(error).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Authentication failed',
    })
  })

  it('maps 403 to FORBIDDEN', () => {
    const error = makeApiError(403, 'Action not allowed')
    expect(error).toEqual({
      code: 'FORBIDDEN',
      message: 'Action not allowed',
    })
  })

  it('maps Last Admin 409 to LAST_ADMIN', () => {
    const message = 'Last Admin must stay ACTIVE until another Admin exists'
    const error = makeApiError(409, message)
    expect(error).toEqual({
      code: 'LAST_ADMIN',
      message,
    })
  })

  it('maps not-inactive 409 to NOT_INACTIVE', () => {
    const error = makeApiError(409, 'Employee is not inactive')
    expect(error).toEqual({
      code: 'NOT_INACTIVE',
      message: 'Employee is not inactive',
    })
  })

  it('maps already-removed 409 to ALREADY_REMOVED', () => {
    const error = makeApiError(409, 'Employee is already removed')
    expect(error).toEqual({
      code: 'ALREADY_REMOVED',
      message: 'Employee is already removed',
    })
  })

  it('maps an unrecognised 409 to CONFLICT', () => {
    const error = makeApiError(409, 'Something else')
    expect(error).toEqual({
      code: 'CONFLICT',
      message: 'Something else',
    })
  })

  it('maps a missing response to UNKNOWN', () => {
    expect(toApiError(new Error('Network Error'))).toEqual({
      code: 'UNKNOWN',
      message: '',
    })
  })

  it('maps an unmapped status to UNKNOWN', () => {
    const error = makeApiError(500, 'Internal')
    expect(error).toEqual({
      code: 'UNKNOWN',
      message: 'Internal',
    })
  })

  it('has pt and en copy for every ApiErrorCode', () => {
    for (const code of Object.keys(API_ERROR_CODES) as ApiErrorCode[]) {
      const ptCopy = pt.lifecycleError[code]
      const enCopy = en.lifecycleError[code]

      expect(ptCopy, `pt.json missing lifecycleError.${code}`).toEqual(expect.any(String))
      expect(ptCopy.length).toBeGreaterThan(0)
      expect(enCopy, `en.json missing lifecycleError.${code}`).toEqual(expect.any(String))
      expect(enCopy.length).toBeGreaterThan(0)
    }
  })
})
