import type { CustomerRank } from '../types/customer'
import type { SelectFilterOption } from '../types/select-filter'

export const CUSTOMER_RANKS: CustomerRank[] = ['BRONZE', 'PRATA', 'OURO']

/** Filter chips and rank sort: Ouro, then Prata, then Bronze. */
export const CUSTOMER_RANK_LADDER: CustomerRank[] = ['OURO', 'PRATA', 'BRONZE']

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
  PRATA: {
    label: 'Prata',
    icon: 'ph:star-fill',
    tone: 'bg-[#8b95a1] text-white',
    iconTone: 'text-[#6d7784]',
    hoverTone: 'hover:border-[#8b95a1]/50 hover:bg-[#8b95a1]/8',
  },
  OURO: {
    label: 'Ouro',
    icon: 'ph:crown-fill',
    tone: 'bg-[#d4a017] text-white',
    iconTone: 'text-[#c49412]',
    hoverTone: 'hover:border-[#d4a017]/50 hover:bg-[#d4a017]/8',
  },
}

export const CUSTOMER_RANK_OPTIONS: SelectFilterOption[] = CUSTOMER_RANKS.map((rank) => ({
  id: rank,
  label: customerRankPatch[rank].label,
  value: rank,
}))

export function isCustomerRank(value: string): value is CustomerRank {
  return CUSTOMER_RANKS.includes(value as CustomerRank)
}
