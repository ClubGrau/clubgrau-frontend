import { describe, expect, it } from 'vitest'
import { unwrapSuccessEnvelope } from './unwrap-success-envelope'

describe('unwrapSuccessEnvelope', () => {
  it('unwraps a login body to the inner token object', () => {
    expect(unwrapSuccessEnvelope({ data: { token: 'jwt' } })).toEqual({ token: 'jwt' })
  })

  it('unwraps a read model without a sibling token', () => {
    expect(unwrapSuccessEnvelope({ data: { id: 'emp-1', name: 'João' } })).toEqual({
      id: 'emp-1',
      name: 'João',
    })
  })

  it('keeps a sibling session token on an own-data save', () => {
    expect(
      unwrapSuccessEnvelope({
        data: { id: 'emp-1', name: 'João Silva' },
        token: 'reissued',
      }),
    ).toEqual({
      id: 'emp-1',
      name: 'João Silva',
      token: 'reissued',
    })
  })

  it('leaves a list payload without adding token', () => {
    expect(unwrapSuccessEnvelope({ data: { employees: [], total: 0 } })).toEqual({
      employees: [],
      total: 0,
    })
  })

  it('leaves an error body untouched', () => {
    expect(unwrapSuccessEnvelope({ error: 'Invalid param name' })).toEqual({
      error: 'Invalid param name',
    })
  })
})
