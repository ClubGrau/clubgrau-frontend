import type { MaybeRef } from 'vue'
import type { GetEmployeesParams } from './types'

export const employeeQueryKeys = {
  all: ['employees'] as const,
  list: (params: MaybeRef<GetEmployeesParams>) => ['employees', params] as const,
}
