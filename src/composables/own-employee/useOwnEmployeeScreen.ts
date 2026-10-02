import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toApiError } from '../../domain/api-error'
import { httpOwnEmployeeApi } from '../../services/api/employees/http-own-employee-api'
import type {
  GetOwnEmployeeApi,
  UpdateOwnEmployeeDataApi,
} from '../../services/api/employees/types'
import { useAuthStore } from '../../stores/auth'
import type { Employee } from '../../types/employee'
import { useGetOwnEmployee } from './useGetOwnEmployee'
import { useUpdateOwnEmployeeData } from './useUpdateOwnEmployeeData'

export function useOwnEmployeeScreen(
  api: GetOwnEmployeeApi & UpdateOwnEmployeeDataApi = httpOwnEmployeeApi,
) {
  const authStore = useAuthStore()
  const router = useRouter()
  const formOpen = ref(false)

  const ownEmployee = useGetOwnEmployee(api, formOpen)

  const leaveSession = () => {
    formOpen.value = false
    authStore.logout()
    void router.push('/login')
  }

  const { updateOwnEmployeeData, isUpdating } = useUpdateOwnEmployeeData(api, {
    onUpdated: (result) => {
      if (result.token) authStore.setSession({ token: result.token })
      formOpen.value = false
    },
    onUnauthorized: leaveSession,
  })

  watch(ownEmployee.error, (error) => {
    if (!error) return
    if (toApiError(error).code === 'UNAUTHORIZED') leaveSession()
  })

  const openForm = () => {
    formOpen.value = true
  }

  const closeForm = () => {
    formOpen.value = false
  }

  const save = (payload: Employee.UpdateOwnDataCommand) => {
    updateOwnEmployeeData(payload)
  }

  return {
    isFormOpen: formOpen,
    employee: ownEmployee.employee,
    isLoading: ownEmployee.isLoading,
    isLoadError: ownEmployee.isError,
    isSaving: isUpdating,
    openForm,
    closeForm,
    retryLoad: ownEmployee.retry,
    save,
  }
}
