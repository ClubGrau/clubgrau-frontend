export type CustomerRank = 'BRONZE' | 'PRATA' | 'OURO';

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

  /** Table row: Entity + computed initials. */
  export type ListItem = Entity & { initials: string };

  export interface CreateCommand {
    name: string;
    email: string;
    phone: string;
    nif: string;
    referral: string;
    rank: CustomerRank | '';
  }
}
