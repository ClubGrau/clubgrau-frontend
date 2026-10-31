import { computed } from 'vue'
import { canAccessEmployees } from '../../domain/actor-display'
import { httpCustomersApi } from '../../services/api/customers/http-customers-api'
import type { GetCustomersApi } from '../../services/api/customers/types'
import { httpEmployeesApi } from '../../services/api/employees/http-employees-api'
import type { GetEmployeesApi } from '../../services/api/employees/types'
import { httpIndicationsApi } from '../../services/api/indications/http-indications-api'
import type { GetIndicationCatalogApi } from '../../services/api/indications/types'
import { useAuthStore } from '../../stores/auth'
import { useDashboard } from './useDashboard'

export function useDashboardScreen(
  customersApi: GetCustomersApi = httpCustomersApi,
  employeesApi: GetEmployeesApi = httpEmployeesApi,
  catalogApi: GetIndicationCatalogApi = httpIndicationsApi,
) {
  const authStore = useAuthStore()
  const includeFloor = computed(() => canAccessEmployees(authStore.actor))

  return useDashboard(customersApi, {
    getEmployeesApi: employeesApi,
    getCatalogApi: catalogApi,
    enabled: includeFloor,
  })
}
