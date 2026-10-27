import { describe, expect, it } from 'vitest'
import { mapLinkableIndicationOrigins } from './map-linkable-indication-origins'

describe('mapLinkableIndicationOrigins', () => {
  it('keeps id, category and name in the order the read sends', () => {
    expect(
      mapLinkableIndicationOrigins({
        origins: [
          { id: 'canal-1', categoryId: 'canal', name: 'Instagram' },
          { id: 'campanha-1', categoryId: 'campanha', name: 'Verão' },
        ],
      }),
    ).toEqual([
      { id: 'canal-1', categoryId: 'canal', name: 'Instagram' },
      { id: 'campanha-1', categoryId: 'campanha', name: 'Verão' },
    ])
  })

  it('drops amigo, ended-only extras, and a payload that is not a list', () => {
    expect(
      mapLinkableIndicationOrigins({
        origins: [
          { id: 'canal-1', categoryId: 'canal', name: 'Instagram', active: true },
          { id: 'amigo-1', categoryId: 'amigo', name: 'Marina' },
          { id: '', categoryId: 'canal', name: 'Blank' },
        ],
      }),
    ).toEqual([{ id: 'canal-1', categoryId: 'canal', name: 'Instagram' }])

    expect(mapLinkableIndicationOrigins(null)).toEqual([])
    expect(mapLinkableIndicationOrigins({ origins: [] })).toEqual([])
  })
})
