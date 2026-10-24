export type IndicationCategoryId = 'canal' | 'campanha' | 'amigo'

/** Canal and Campanha. Amigo does not hold catalog origins. */
export type IndicationOriginCategoryId = Exclude<IndicationCategoryId, 'amigo'>

/** Category code for Amigo. A friend row points at a customer, not a catalog origin. */
export const FRIEND_CATEGORY_ID: IndicationCategoryId = 'amigo'

export namespace Indication {
  export interface Origin {
    id: string
    categoryId: IndicationOriginCategoryId
    name: string
    active: boolean
  }

  /** Active Canal or Campanha origin the create form may link. */
  export interface LinkableOrigin {
    id: string
    categoryId: IndicationOriginCategoryId
    name: string
  }

  export interface Category {
    id: IndicationCategoryId
    name: string
    holdsOrigins: boolean
    origins: Origin[]
  }

  export interface Catalog {
    categories: Category[]
  }

  export interface CreateOriginCommand {
    categoryId: string
    name: string
  }

  export interface CorrectOriginNameCommand {
    id: string
    name: string
  }
}

export type IndicationOriginResult = { id: string }
