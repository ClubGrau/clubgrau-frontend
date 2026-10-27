import type { Indication, IndicationOriginCategoryId } from '../../../types/indication'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isOriginCategoryId(value: unknown): value is IndicationOriginCategoryId {
  return value === 'canal' || value === 'campanha'
}

function mapOrigin(value: unknown): Indication.LinkableOrigin | null {
  if (!isRecord(value) || !isOriginCategoryId(value.categoryId)) return null
  if (typeof value.id !== 'string' || value.id.length === 0) return null
  if (typeof value.name !== 'string' || value.name.length === 0) return null
  return {
    id: value.id,
    categoryId: value.categoryId,
    name: value.name,
  }
}

/** Maps GET /api/indication-linkable-origins onto the origins the picker shows. */
export function mapLinkableIndicationOrigins(payload: unknown): Indication.LinkableOrigin[] {
  if (!isRecord(payload) || !Array.isArray(payload.origins)) return []
  return payload.origins.flatMap((origin) => {
    const mapped = mapOrigin(origin)
    return mapped ? [mapped] : []
  })
}
