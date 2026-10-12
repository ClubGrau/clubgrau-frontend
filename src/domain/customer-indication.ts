import {
  FRIEND_CATEGORY_ID,
  type Indication,
  type IndicationCategoryId,
  type IndicationOriginCategoryId,
} from '../types/indication'

export interface CustomerIndicationLink {
  wasReferred: boolean
  indicationCategoryId: IndicationCategoryId | null
  indicationOriginId: string | null
  referral: string
}

export interface CustomerFriendOption {
  id: string
  name: string
}

export interface CustomerIndicationInput {
  wasReferred: boolean
  categoryId: string
  origin: Indication.Origin | null
  friend: CustomerFriendOption | null
}

export function isIndicationOriginCategoryId(
  value: string,
): value is IndicationOriginCategoryId {
  return value === 'canal' || value === 'campanha'
}

/** Origins still offered for a new customer in the selected category. */
export function selectableOrigins(
  categories: readonly Indication.Category[],
  categoryId: IndicationOriginCategoryId,
): Indication.Origin[] {
  const category = categories.find((item) => item.id === categoryId)
  if (!category?.holdsOrigins) return []
  return category.origins.filter(
    (origin) => origin.active && origin.categoryId === categoryId,
  )
}

/**
 * One indication per customer: a catalog origin, or one existing customer when
 * the type is Amigo. An incomplete "yes" returns null so the form can refuse.
 */
export function toCustomerIndication(
  input: CustomerIndicationInput,
): CustomerIndicationLink | null {
  if (!input.wasReferred) {
    return {
      wasReferred: false,
      indicationCategoryId: null,
      indicationOriginId: null,
      referral: '',
    }
  }

  if (input.categoryId === FRIEND_CATEGORY_ID) {
    const name = input.friend?.name.trim() ?? ''
    if (!input.friend || name.length === 0) return null
    return {
      wasReferred: true,
      indicationCategoryId: FRIEND_CATEGORY_ID,
      indicationOriginId: null,
      referral: name,
    }
  }

  if (
    !isIndicationOriginCategoryId(input.categoryId) ||
    !input.origin?.active ||
    input.origin.categoryId !== input.categoryId
  ) {
    return null
  }

  return {
    wasReferred: true,
    indicationCategoryId: input.categoryId,
    indicationOriginId: input.origin.id,
    referral: input.origin.name,
  }
}
