import type { CustomerRank } from '../types/customer'

export const CUSTOMER_RANKS: CustomerRank[] = ['BRONZE', 'SILVER', 'GOLD']

/** Rank the API assigns on create. The client does not send it. */
export const INITIAL_CUSTOMER_RANK: CustomerRank = 'BRONZE'

/** Filter chips and rank sort: Ouro, then Prata, then Bronze. */
export const CUSTOMER_RANK_LADDER: CustomerRank[] = ['GOLD', 'SILVER', 'BRONZE']

export interface CustomerRankPatchConfig {
  label: string
  icon: string
  tone: string
}

export const customerRankPatch: Record<CustomerRank, CustomerRankPatchConfig> = {
  BRONZE: {
    label: 'Bronze',
    icon: 'ph:medal-fill',
    tone: 'bg-[#c47a3a] text-white',
  },
  SILVER: {
    label: 'Prata',
    icon: 'ph:star-fill',
    tone: 'bg-[#8b95a1] text-white',
  },
  GOLD: {
    label: 'Ouro',
    icon: 'ph:crown-fill',
    tone: 'bg-[#d4a017] text-white',
  },
}

export function isCustomerRank(value: string): value is CustomerRank {
  return CUSTOMER_RANKS.includes(value as CustomerRank)
}
