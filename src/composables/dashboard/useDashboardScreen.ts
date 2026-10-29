import { httpCustomersApi } from '../../services/api/customers/http-customers-api'
import type { GetCustomersApi } from '../../services/api/customers/types'
import { hardcodedDashboardApi } from '../../services/api/dashboard/hardcoded-dashboard-api'
import type { GetDashboardOperationsApi } from '../../services/api/dashboard/types'
import { useDashboard } from './useDashboard'

export function useDashboardScreen(
  customersApi: GetCustomersApi = httpCustomersApi,
  operationsApi: GetDashboardOperationsApi = hardcodedDashboardApi,
) {
  return useDashboard(customersApi, operationsApi)
}
