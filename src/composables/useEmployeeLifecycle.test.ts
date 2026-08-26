import { describe, expect, it } from 'vitest'
import { toastMessageForDeactivateError } from './useEmployeeLifecycle'

function httpError(status: number, error?: string) {
  return {
    response: {
      status,
      data: error === undefined ? {} : { error },
    },
  }
}

describe('toastMessageForDeactivateError', () => {
  it('maps Last Admin 409 to the operator copy and does not use the English API string', () => {
    const message = toastMessageForDeactivateError(
      httpError(409, 'Last Admin must stay ACTIVE until another Admin exists'),
    )
    expect(message).toBe(
      'É preciso existir outro Administrador ativo antes desta ação.',
    )
  })

  it('maps 403 to Ação não permitida', () => {
    expect(toastMessageForDeactivateError(httpError(403, 'Action not allowed'))).toBe(
      'Ação não permitida.',
    )
  })

  it('maps 400 and other 409s to the API error string', () => {
    expect(toastMessageForDeactivateError(httpError(400, 'Invalid payload'))).toBe(
      'Invalid payload',
    )
    expect(toastMessageForDeactivateError(httpError(409, 'Something else'))).toBe(
      'Something else',
    )
  })

  it('does not emit a deactivate toast on 401', () => {
    expect(
      toastMessageForDeactivateError(httpError(401, 'Authentication failed')),
    ).toBeNull()
  })

  it('returns the API string for unknown failures when present', () => {
    expect(toastMessageForDeactivateError(httpError(500, 'Internal'))).toBe('Internal')
  })

  it('returns null when there is no API error string', () => {
    expect(toastMessageForDeactivateError(new Error('Network Error'))).toBeNull()
  })
})
