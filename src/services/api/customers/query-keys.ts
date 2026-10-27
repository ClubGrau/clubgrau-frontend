import type { MaybeRef } from 'vue'
import type { GetCustomersParams } from './types'

export const customerQueryKeys = {
  all: ['customers'] as const,
  list: (params: MaybeRef<GetCustomersParams>) => ['customers', params] as const,
  joinedThisMonth: () => ['customers', 'joined-this-month'] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
}
