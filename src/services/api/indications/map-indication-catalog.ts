import type { Indication, IndicationCategoryId } from '../../../types/indication'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCategoryId(value: unknown): value is IndicationCategoryId {
  return value === 'canal' || value === 'campanha' || value === 'amigo'
}

function mapOrigin(
  categoryId: 'canal' | 'campanha',
  value: unknown,
): Indication.Origin | null {
  if (!isRecord(value)) return null
  if (value.categoryId !== categoryId) return null
  if (typeof value.id !== 'string' || value.id.length === 0) return null
  if (typeof value.name !== 'string') return null
  if (typeof value.active !== 'boolean') return null
  return {
    id: value.id,
    categoryId,
    name: value.name,
    active: value.active,
  }
}

function mapCategory(value: unknown): Indication.Category | null {
  if (!isRecord(value) || !isCategoryId(value.id)) return null
  if (typeof value.name !== 'string' || typeof value.holdsOrigins !== 'boolean') return null
  if (!Array.isArray(value.origins)) return null

  const holdsOrigins = value.holdsOrigins
  const id = value.id
  const origins =
    holdsOrigins && (id === 'canal' || id === 'campanha')
      ? value.origins.flatMap((origin) => {
          const mapped = mapOrigin(id, origin)
          return mapped ? [mapped] : []
        })
      : []

  return {
    id,
    name: value.name,
    holdsOrigins,
    origins,
  }
}

/** Maps GET /api/indication-catalog onto the catalog the screen renders. */
export function mapIndicationCatalog(payload: unknown): Indication.Catalog {
  if (!isRecord(payload) || !Array.isArray(payload.categories)) {
    return { categories: [] }
  }

  return {
    categories: payload.categories.flatMap((category) => {
      const mapped = mapCategory(category)
      return mapped ? [mapped] : []
    }),
  }
}
