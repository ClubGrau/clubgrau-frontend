import type { DashboardOperations } from '../../../types/dashboard'

export interface GetDashboardOperationsApi {
  getOperations(): Promise<DashboardOperations>
}
