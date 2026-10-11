import { describe, expect, it } from 'vitest'
import {
  indicationCatalogErrorKey,
  toastKeyForIndicationWriteError,
} from './indication-write-error'

function httpError(status: number, error?: string) {
  return {
    response: {
      status,
      data: error === undefined ? {} : { error },
    },
  }
}

describe('toastKeyForIndicationWriteError', () => {
  it('maps a reserved name to the conflict key and does not use the English API string', () => {
    expect(
      toastKeyForIndicationWriteError(
        httpError(409, 'Indication origin name is already reserved'),
        'Indications.toast.nameTaken',
      ),
    ).toBe('Indications.toast.nameTaken')
  })

  it('maps 400 and 403 onto catalog copy', () => {
    expect(toastKeyForIndicationWriteError(httpError(400, 'Indication origin not found'))).toBe(
      'Indications.toast.invalid',
    )
    expect(toastKeyForIndicationWriteError(httpError(403, 'Action not allowed'))).toBe(
      'Indications.toast.forbidden',
    )
  })

  it('stays quiet on 401', () => {
    expect(toastKeyForIndicationWriteError(httpError(401, 'Authentication failed'))).toBeNull()
  })
})

describe('indicationCatalogErrorKey', () => {
  it('uses the forbidden copy for EMPLOYEE and a load copy otherwise', () => {
    expect(indicationCatalogErrorKey(httpError(403, 'Action not allowed'))).toBe(
      'Indications.error.forbidden',
    )
    expect(indicationCatalogErrorKey(httpError(500, 'Internal'))).toBe('Indications.error.load')
  })
})
