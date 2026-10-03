export type CustomerRank = 'BRONZE' | 'PRATA' | 'OURO';

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
  }

  /** Table row: Entity, initials, and referral links resolved from the wallet. */
  export type ListItem = Entity & {
    initials: string;
    referralCustomerId: string | null;
    referredCount: number;
  };

  export interface CreateCommand {
    name: string;
    email: string;
    phone: string;
    nif: string;
    referral: string;
    rank: CustomerRank | '';
  }
}
