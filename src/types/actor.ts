import type { EmployeeStatus } from "./employee"

export type ActorRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN'

export interface Actor {
  id: string
  name: string | null
  role: ActorRole | null
  status: EmployeeStatus | null
}
