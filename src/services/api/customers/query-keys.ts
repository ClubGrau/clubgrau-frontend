import type { MaybeRef } from 'vue'
import type { GetCustomersParams } from './types'

export const customerQueryKeys = {
  all: ['customers'] as const,
  list: (params: MaybeRef<GetCustomersParams>) => ['customers', params] as const,
}
