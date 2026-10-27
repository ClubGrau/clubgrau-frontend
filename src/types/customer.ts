import type { IndicationCategoryId, IndicationOriginCategoryId } from './indication';

/** Contract values. The UI maps them to Bronze, Prata and Ouro. */
export type CustomerRank = 'BRONZE' | 'SILVER' | 'GOLD';

/** One indication on create: a catalog origin, or an existing customer. */
export type CustomerIndication =
  | { categoryId: IndicationOriginCategoryId; originId: string }
  | { categoryId: 'amigo'; referrerCustomerId: string };

export type CustomerSortKey = 'name' | 'rank' | 'createdAt';

export type CustomerSortDirection = 'asc' | 'desc';

export namespace Customer {
  /** Shape the list understands. Swap the adapter; keep this. */
  export interface Entity {
    id: string;
    name: string;
    email: string;
    phone: string;
    nif: string;
    referral: string;
    rank: CustomerRank | '';
    createdAt: string;
    indicationCategoryId?: IndicationCategoryId | null;
    indicationOriginId?: string | null;
    referralCustomerId?: string;
  }

  /** Table row: Entity, initials, and referral links resolved from the wallet. */
  export type ListItem = Omit<Entity, 'referralCustomerId'> & {
    initials: string;
    referralCustomerId: string | null;
    referredCount: number;
  };

  /** What the form submits. Rank is not an input: the API stores Bronze. */
  export interface CreateCommand {
    name: string;
    email: string;
    phone: string;
    nif: string;
    indication: CustomerIndication | null;
  }
}
