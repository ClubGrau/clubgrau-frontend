import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { canCreate as actorCanCreate, lifecycleActions, type LifecycleTarget } from '../domain/employee-lifecycle'
import { httpEmployeesApi } from '../services/api/employees/http-employees-api'
import type {
  CreateEmployeeApi,
  GetEmployeesApi,
  RemoveEmployeeApi,
  UpdateEmployeeStatusApi,
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
    RemoveEmployeeApi = httpEmployeesApi,
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
    total,
  } = list

  const drawer = useEmployeeDrawer(employees, filteredEmployees)
  const {
    activeEmployeeId,
    selectedEmployee,
    detailEmployee,
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

  const selection = useEmployeeSelection({
    onEdit: openEditDrawer,
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

  const handleUpdateEmployee = (payload: Employee.UpdateCommand) => {
    openDetailDrawer(payload.id)
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
    total,
    canCreate,
    ...drawer,
    ...selection,
    isDeactivating,
    reactivate,
    isReactivating,
    isRemoving,
    removeError,
    isCreating,
    menuActions,
    detailActions,
    isSelfDeactivate,
    removeEmployeeName,
    handleCreateEmployee,
    handleUpdateEmployee,
    onEmployeeRowClick,
    handleInactivateEmployee,
    handleRemoveEmployee,
  }
}
