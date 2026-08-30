import { computed, ref, type Ref } from 'vue'
import type { EmployeeDrawerState } from '../types/drawer'
import type { Employee, EmployeeStatus } from '../types/employee'

export function useEmployeeDrawer(
  employees: Ref<Employee.ListItem[]>,
  filteredEmployees: Ref<Employee.ListItem[]>,
) {
  const drawer = ref<EmployeeDrawerState>({ open: false })
  const targetSnapshot = ref<Employee.ListItem | null>(null)

  const captureSnapshot = (employeeId: string) => {
    const live = employees.value.find((employee) => employee.id === employeeId)
    if (live) {
      targetSnapshot.value = { ...live }
    }
  }

  const isCreateDrawerOpen = computed(
    () => drawer.value.open && drawer.value.mode === 'create',
  )

  const isEditDrawerOpen = computed(
    () => drawer.value.open && drawer.value.mode === 'edit',
  )

  const isDeactivateModalOpen = computed(
    () => drawer.value.open && drawer.value.mode === 'inactivate',
  )

  const isRemoveModalOpen = computed(
    () => drawer.value.open && drawer.value.mode === 'remove',
  )

  const activeEmployeeId = computed(() => {
    const state = drawer.value
    if (!state.open || state.mode === 'create') return null
    return state.employeeId
  })

  const modalWidthClass = 'w-full max-w-md'

  const selectedEmployee = computed(() => {
    if (activeEmployeeId.value === null) return null
    return (
      employees.value.find((employee) => employee.id === activeEmployeeId.value) ??
      null
    )
  })

  const detailEmployee = computed(() => {
    const state = drawer.value
    if (!state.open || state.mode !== 'detail') return null
    const live =
      employees.value.find((employee) => employee.id === state.employeeId) ?? null
    const snapshot =
      targetSnapshot.value?.id === state.employeeId ? targetSnapshot.value : null
    if (live && snapshot) return { ...live, status: snapshot.status }
    return live ?? snapshot
  })

  const editEmployee = computed(() => {
    const state = drawer.value
    if (!state.open || state.mode !== 'edit') return null
    return selectedEmployee.value
  })

  const detailIndex = computed(() => {
    if (activeEmployeeId.value === null) return -1
    return filteredEmployees.value.findIndex(
      (employee) => employee.id === activeEmployeeId.value,
    )
  })

  const canGoPreviousEmployee = computed(() => detailIndex.value > 0)

  const canGoNextEmployee = computed(
    () =>
      detailIndex.value >= 0 &&
      detailIndex.value < filteredEmployees.value.length - 1,
  )

  const drawerWidthClass = computed(() =>
    drawer.value.open ? 'w-full max-w-3xl' : 'w-full max-w-md',
  )

  const openCreateDrawer = () => {
    drawer.value = { open: true, mode: 'create' }
  }

  const openDetailDrawer = (employeeId: string) => {
    captureSnapshot(employeeId)
    drawer.value = { open: true, mode: 'detail', employeeId }
  }

  const openEditDrawer = (employeeId: string) => {
    drawer.value = { open: true, mode: 'edit', employeeId }
  }

  const openInactivateDrawer = (employeeId: string) => {
    captureSnapshot(employeeId)
    drawer.value = { open: true, mode: 'inactivate', employeeId }
  }

  const patchSnapshotStatus = (status: EmployeeStatus) => {
    if (!targetSnapshot.value) return
    targetSnapshot.value = { ...targetSnapshot.value, status }
  }

  const clearSnapshot = () => {
    targetSnapshot.value = null
  }

  const openRemoveDrawer = (employeeId: string) => {
    captureSnapshot(employeeId)
    drawer.value = { open: true, mode: 'remove', employeeId }
  }

  const closeDrawer = () => {
    clearSnapshot()
    drawer.value = { open: false }
  }

  const closeModal = () => {
    closeDrawer()
  }

  const closeFormDrawer = () => {
    if (isEditDrawerOpen.value && activeEmployeeId.value !== null) {
      openDetailDrawer(activeEmployeeId.value)
      return
    }
    closeDrawer()
  }

  const goToPreviousEmployee = () => {
    if (!canGoPreviousEmployee.value) return
    const previous = filteredEmployees.value[detailIndex.value - 1]
    openDetailDrawer(previous.id)
  }

  const goToNextEmployee = () => {
    if (!canGoNextEmployee.value) return
    const next = filteredEmployees.value[detailIndex.value + 1]
    openDetailDrawer(next.id)
  }

  return {
    drawer,
    isCreateDrawerOpen,
    isEditDrawerOpen,
    activeEmployeeId,
    selectedEmployee,
    detailEmployee,
    editEmployee,
    targetSnapshot,
    isDeactivateModalOpen,
    isRemoveModalOpen,
    modalWidthClass,
    canGoPreviousEmployee,
    canGoNextEmployee,
    drawerWidthClass,
    openCreateDrawer,
    openDetailDrawer,
    openEditDrawer,
    openInactivateDrawer,
    openRemoveDrawer,
    patchSnapshotStatus,
    clearSnapshot,
    closeDrawer,
    closeModal,
    closeFormDrawer,
    goToPreviousEmployee,
    goToNextEmployee,
  }
}
