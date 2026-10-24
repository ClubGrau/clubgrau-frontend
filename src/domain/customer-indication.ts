import {
  FRIEND_CATEGORY_ID,
  type Indication,
  type IndicationOriginCategoryId,
} from '../types/indication'
import type { CustomerIndication } from '../types/customer'

export interface CustomerFriendOption {
  id: string
  name: string
}

export interface CustomerIndicationInput {
  wasReferred: boolean
  categoryId: string
  origin: Indication.LinkableOrigin | null
  friend: CustomerFriendOption | null
}

/**
 * What the form may submit. `null` means the "yes" answer is incomplete and
 * the form must not submit. `indication: null` means the customer walked in.
 */
export interface CustomerIndicationDraft {
  indication: CustomerIndication | null
}

export function isIndicationOriginCategoryId(
  value: string,
): value is IndicationOriginCategoryId {
  return value === 'canal' || value === 'campanha'
}

/** Active origins of the selected category, in the order the linkable read sent them. */
export function selectableOrigins(
  origins: readonly Indication.LinkableOrigin[],
  categoryId: IndicationOriginCategoryId,
): Indication.LinkableOrigin[] {
  return origins.filter((origin) => origin.categoryId === categoryId)
}

/**
 * One indication per customer: a linkable origin, or one existing customer when
 * the type is Amigo. An incomplete "yes" returns null so the form can refuse.
 */
export function toCustomerIndication(
  input: CustomerIndicationInput,
): CustomerIndicationDraft | null {
  if (!input.wasReferred) {
    return { indication: null }
  }

  if (input.categoryId === FRIEND_CATEGORY_ID) {
    const name = input.friend?.name.trim() ?? ''
    const friendId = input.friend?.id.trim() ?? ''
    if (!input.friend || name.length === 0 || friendId.length === 0) return null
    return {
      indication: {
        categoryId: 'amigo',
        referrerCustomerId: friendId,
      },
    }
  }

  if (
    !isIndicationOriginCategoryId(input.categoryId) ||
    !input.origin ||
    input.origin.categoryId !== input.categoryId ||
    input.origin.id.trim().length === 0
  ) {
    return null
  }

  return {
    indication: {
      categoryId: input.categoryId,
      originId: input.origin.id,
    },
  }
}
