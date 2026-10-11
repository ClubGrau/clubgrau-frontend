export type IndicationCategoryId = 'canal' | 'campanha' | 'amigo'

/** Category code for Amigo. A friend row points at a customer, not a catalog origin. */
export const FRIEND_CATEGORY_ID: IndicationCategoryId = 'amigo'

export namespace Indication {
  export interface Origin {
    id: string
    categoryId: 'canal' | 'campanha'
    name: string
    active: boolean
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
