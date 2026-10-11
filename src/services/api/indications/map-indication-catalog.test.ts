import { describe, expect, it } from 'vitest'
import { mapIndicationCatalog } from './map-indication-catalog'

describe('mapIndicationCatalog', () => {
  it('keeps category order and origin fields the catalog read sends', () => {
    const catalog = mapIndicationCatalog({
      categories: [
        {
          id: 'canal',
          name: 'Canal',
          holdsOrigins: true,
          origins: [
            {
              id: '507f1f77bcf86cd799439011',
              categoryId: 'canal',
              name: 'Facebook',
              active: true,
              position: 1,
            },
          ],
        },
        {
          id: 'campanha',
          name: 'Campanha',
          holdsOrigins: true,
          origins: [],
        },
        {
          id: 'amigo',
          name: 'Amigo',
          holdsOrigins: false,
          origins: [{ id: 'x', categoryId: 'amigo', name: 'João', active: true }],
        },
      ],
    })

    expect(catalog).toEqual({
      categories: [
        {
          id: 'canal',
          name: 'Canal',
          holdsOrigins: true,
          origins: [
            {
              id: '507f1f77bcf86cd799439011',
              categoryId: 'canal',
              name: 'Facebook',
              active: true,
            },
          ],
        },
        {
          id: 'campanha',
          name: 'Campanha',
          holdsOrigins: true,
          origins: [],
        },
        {
          id: 'amigo',
          name: 'Amigo',
          holdsOrigins: false,
          origins: [],
        },
      ],
    })
  })

  it('drops a category the catalog does not know', () => {
    expect(
      mapIndicationCatalog({
        categories: [{ id: 'evento', name: 'Evento', holdsOrigins: true, origins: [] }],
      }),
    ).toEqual({ categories: [] })
  })
})
