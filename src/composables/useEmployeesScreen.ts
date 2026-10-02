import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOwnEmployeeScreen } from './own-employee/useOwnEmployeeScreen'
import { canCreate as actorCanCreate, lifecycleActions, type LifecycleTarget } from '../domain/employee-lifecycle'
import { httpEmployeesApi } from '../services/api/employees/http-employees-api'
import { httpOwnEmployeeApi } from '../services/api/employees/http-own-employee-api'
import type {
  CreateEmployeeApi,
  GetEmployeesApi,
  GetOwnEmployeeApi,
  RemoveEmployeeApi,
  UpdateEmployeeStatusApi,
  UpdateMainEmployeeDataApi,
  UpdateOwnEmployeeDataApi,
  UpdatePersonalEmployeeDataApi,
  UpdateProfessionalEmployeeDataApi,
} from '../services/api/employees/types'
import { useAuthStore } from '../stores/auth'
import type { Employee } from '../types/employee'
import { useCreateEmployee } from './useCreateEmployee'
import { useDeactivateEmployee } from './useDeactivateEmployee'
import { useEmployeeDrawer } from './useEmployeeDrawer'
import { useEmployeeSelection } from './useEmployeeSelection'
import { useEmployees, type StatusFilter } from './useEmployees'
import { useReactivateEmployee } from './useReactivateEmployee'
import { useRemoveEmployee } from './useRemoveEmployee'
import { useUpdateMainEmployeeData } from './useUpdateMainEmployeeData'
import { useUpdatePersonalEmployeeData } from './useUpdatePersonalEmployeeData'
import { useUpdateProfessionalEmployeeData } from './useUpdateProfessionalEmployeeData'

export type { StatusFilter }

const noLifecycleActions = {
  canDeactivate: false,
  canReactivate: false,
  canRemove: false,
}

function toLifecycleTarget(employee: Employee.ListItem): LifecycleTarget {
  return {
    id: employee.id,
    role: employee.role,
    status: employee.status,
  }
}

export function useEmployeesScreen(
  api: GetEmployeesApi &
    CreateEmployeeApi &
    UpdateEmployeeStatusApi &
    RemoveEmployeeApi &
    UpdateMainEmployeeDataApi &
    UpdatePersonalEmployeeDataApi &
    UpdateProfessionalEmployeeDataApi = httpEmployeesApi,
  ownApi: GetOwnEmployeeApi & UpdateOwnEmployeeDataApi = httpOwnEmployeeApi,
) {
  const authStore = useAuthStore()
  const router = useRouter()

  const list = useEmployees(api)
  const {
    employees,
    filteredEmployees,
    pageSize,
    currentPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    roleFilter,
    onRoleFilterChange,
    roleOptions,
    stats,
    total,
    isLoading: isListLoading,
    isFetching: isListFetching,
    isStatsLoading,
  } = list

  const drawer = useEmployeeDrawer(employees, filteredEmployees)
  const {
    activeEmployeeId,
    selectedEmployee,
    detailEmployee,
    editEmployee,
    targetSnapshot,
    isRemoveModalOpen,
    openDetailDrawer,
    openEditDrawer,
    openInactivateDrawer,
    openRemoveDrawer,
    patchSnapshotStatus,
    closeDrawer,
  } = drawer

  const { deactivate, isDeactivating } = useDeactivateEmployee(api, {
    getActorId: () => authStore.actor?.id ?? null,
    onStatusChanged: () => {
      closeDrawer()
    },
    onSelfDeactivated: () => {
      authStore.logout()
      void router.push('/login')
    },
  })

  const { reactivate, isReactivating } = useReactivateEmployee(api, {
    onReactivated: (result) => {
      if (activeEmployeeId.value !== result.id) openDetailDrawer(result.id)
      patchSnapshotStatus(result.status)
    },
  })

  const { remove, isRemoving, removeError } = useRemoveEmployee(api, {
    onRemoved: () => {
      closeDrawer()
    },
    onRemoveConflict: (id) => {
      openDetailDrawer(id)
    },
  })

  const { create: createEmployee, isCreating } = useCreateEmployee(api, {
    onCreated: () => {
      currentPage.value = 1
      closeDrawer()
    },
  })

  const onEmployeeSectionUpdated = (result: { id: string }) => {
    openDetailDrawer(result.id)
  }

  const { updateMain, isUpdatingMain } = useUpdateMainEmployeeData(api, {
    onUpdated: onEmployeeSectionUpdated,
  })

  const { updatePersonal, isUpdatingPersonal } = useUpdatePersonalEmployeeData(api, {
    onUpdated: onEmployeeSectionUpdated,
  })

  const { updateProfessional, isUpdatingProfessional } = useUpdateProfessionalEmployeeData(
    api,
    {
      onUpdated: (result) => {
        openDetailDrawer(result.id)
        patchSnapshotStatus(result.status)
      },
    },
  )

  const ownEmployeeScreen = useOwnEmployeeScreen(ownApi)

  const openEmployeeEditor = (employeeId: string) => {
    if (authStore.actor?.id === employeeId) {
      ownEmployeeScreen.openForm()
      closeDrawer()
      return
    }

    ownEmployeeScreen.closeForm()
    openEditDrawer(employeeId)
  }

  const selection = useEmployeeSelection({
    onEdit: openEmployeeEditor,
    onDeactivate: openInactivateDrawer,
    onReactivate: reactivate,
    onRemove: openRemoveDrawer,
  })

  const canCreate = computed(() => actorCanCreate(authStore.actor))

  const removeEmployeeName = computed(
    () => targetSnapshot.value?.name ?? selectedEmployee.value?.name ?? '',
  )

  const isSelfDeactivate = computed(
    () => activeEmployeeId.value === authStore.actor?.id,
  )

  const menuEmployee = computed(() =>
    selection.openActionsId.value
      ? employees.value.find((employee) => employee.id === selection.openActionsId.value) ?? null
      : null,
  )

  const menuActions = computed(() =>
    menuEmployee.value
      ? lifecycleActions(authStore.actor, toLifecycleTarget(menuEmployee.value))
      : noLifecycleActions,
  )

  const detailActions = computed(() =>
    detailEmployee.value
      ? lifecycleActions(authStore.actor, toLifecycleTarget(detailEmployee.value))
      : noLifecycleActions,
  )

  watch(isRemoveModalOpen, (open) => {
    if (open) removeError.value = null
  })

  const handleCreateEmployee = (payload: Employee.CreateCommand) => {
    createEmployee(payload)
  }

  const handleUpdateMainEmployee = (payload: Employee.UpdateMainDataCommand) => {
    const original = editEmployee.value
    if (!original) return
    updateMain({ command: payload, original })
  }

  const handleUpdatePersonalEmployee = (payload: Employee.UpdatePersonalDataCommand) => {
    updatePersonal(payload)
  }

  const handleUpdateProfessionalEmployee = (
    payload: Employee.UpdateProfessionalDataCommand,
  ) => {
    updateProfessional(payload)
  }

  const onEmployeeRowClick = (event: MouseEvent, id: string) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-row-action]')) return
    openDetailDrawer(id)
  }

  const handleInactivateEmployee = (employeeId: string) => {
    if (!employeeId) return
    deactivate(employeeId)
  }

  const handleRemoveEmployee = (password: string) => {
    remove({ id: activeEmployeeId.value ?? '', password })
  }

  return {
    filteredEmployees,
    pageSize,
    currentPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    roleFilter,
    onRoleFilterChange,
    roleOptions,
    stats,
    total,
    isListLoading,
    isListFetching,
    isStatsLoading,
    canCreate,
    ...drawer,
    openEditDrawer: openEmployeeEditor,
    ...selection,
    isOwnFormOpen: ownEmployeeScreen.isFormOpen,
    ownEmployee: ownEmployeeScreen.employee,
    isOwnEmployeeLoadError: ownEmployeeScreen.isLoadError,
    isSavingOwnEmployee: ownEmployeeScreen.isSaving,
    closeOwnForm: ownEmployeeScreen.closeForm,
    retryOwnEmployeeLoad: ownEmployeeScreen.retryLoad,
    saveOwnEmployee: ownEmployeeScreen.save,
    isDeactivating,
    reactivate,
    isReactivating,
    isRemoving,
    removeError,
    isCreating,
    isUpdatingMain,
    isUpdatingPersonal,
    isUpdatingProfessional,
    menuActions,
    detailActions,
    isSelfDeactivate,
    removeEmployeeName,
    handleCreateEmployee,
    handleUpdateMainEmployee,
    handleUpdatePersonalEmployee,
    handleUpdateProfessionalEmployee,
    onEmployeeRowClick,
    handleInactivateEmployee,
    handleRemoveEmployee,
  }
}
