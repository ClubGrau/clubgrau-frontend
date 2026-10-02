import type { MaybeRef } from 'vue'
import type { GetEmployeesParams } from './types'

export const employeeQueryKeys = {
  all: ['employees'] as const,
  list: (params: MaybeRef<GetEmployeesParams>) => ['employees', params] as const,
}

export const ownEmployeeQueryKeys = {
  all: ['own-employee'] as const,
  me: ['own-employee', 'me'] as const,
}
