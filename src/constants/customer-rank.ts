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
  iconTone: string
  hoverTone: string
}

export const customerRankPatch: Record<CustomerRank, CustomerRankPatchConfig> = {
  BRONZE: {
    label: 'Bronze',
    icon: 'ph:medal-fill',
    tone: 'bg-[#c47a3a] text-white',
    iconTone: 'text-[#c47a3a]',
    hoverTone: 'hover:border-[#c47a3a]/50 hover:bg-[#c47a3a]/8',
  },
  SILVER: {
    label: 'Prata',
    icon: 'ph:star-fill',
    tone: 'bg-[#8b95a1] text-white',
    iconTone: 'text-[#6d7784]',
    hoverTone: 'hover:border-[#8b95a1]/50 hover:bg-[#8b95a1]/8',
  },
  GOLD: {
    label: 'Ouro',
    icon: 'ph:crown-fill',
    tone: 'bg-[#d4a017] text-white',
    iconTone: 'text-[#c49412]',
    hoverTone: 'hover:border-[#d4a017]/50 hover:bg-[#d4a017]/8',
  },
}

export function isCustomerRank(value: string): value is CustomerRank {
  return CUSTOMER_RANKS.includes(value as CustomerRank)
}
