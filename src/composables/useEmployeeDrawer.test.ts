import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useEmployeeDrawer } from './useEmployeeDrawer'
import type { EmployeeShapped } from '../types/employee'

function employee(overrides: Partial<EmployeeShapped> = {}): EmployeeShapped {
  return {
    id: 'emp-1',
    name: 'Ana Silva',
    username: 'ana',
    email: 'ana@clubgrau.com',
    phone: '',
    nif: '',
    permission: 'ADMIN',
    status: 'ACTIVE',
    initials: 'AS',
    department: '',
    dateHired: '2024-01-01',
    gender: '',
    maritalStatus: '',
    address: '',
    languages: '',
    education: '',
    emergencyContact: '',
    emergencyContactRelation: '',
    employmentId: 'emp-1',
    employmentType: '',
    jobTitle: 'ADMIN',
    skills: [],
    ...overrides,
  }
}

describe('useEmployeeDrawer snapshot', () => {
  it('captures the Target when opening Inativar, before the list drops the row', () => {
    const target = employee()
    const employees = ref([target])
    const drawer = useEmployeeDrawer(employees, employees)

    drawer.openInactivateDrawer(target.id)
    employees.value = []

    expect(drawer.targetSnapshot.value).toMatchObject({
      id: 'emp-1',
      status: 'ACTIVE',
    })
  })

  it('keeps the profile after Ativos refetch by falling back to the snapshot', () => {
    const target = employee()
    const employees = ref([target])
    const drawer = useEmployeeDrawer(employees, employees)

    drawer.openInactivateDrawer(target.id)
    employees.value = []
    drawer.openDetailDrawer(target.id)
    drawer.patchSnapshotStatus('INACTIVE')

    expect(drawer.detailEmployee.value).toMatchObject({
      id: 'emp-1',
      name: 'Ana Silva',
      status: 'INACTIVE',
    })
  })

  it('overlays snapshot status on the live row so the fork does not flash ACTIVE', () => {
    const target = employee({ status: 'ACTIVE' })
    const employees = ref([target])
    const drawer = useEmployeeDrawer(employees, employees)

    drawer.openInactivateDrawer(target.id)
    drawer.openDetailDrawer(target.id)
    drawer.patchSnapshotStatus('INACTIVE')

    expect(employees.value[0]?.status).toBe('ACTIVE')
    expect(drawer.detailEmployee.value?.status).toBe('INACTIVE')
  })

  it('does not change status when patch is skipped (Last Admin)', () => {
    const target = employee({ status: 'ACTIVE' })
    const employees = ref([target])
    const drawer = useEmployeeDrawer(employees, employees)

    drawer.openInactivateDrawer(target.id)
    drawer.openDetailDrawer(target.id)

    expect(drawer.detailEmployee.value?.status).toBe('ACTIVE')
  })

  it('drops the snapshot and leaves the detail closed when the drawer closes after Inativar', () => {
    const target = employee()
    const employees = ref([target])
    const drawer = useEmployeeDrawer(employees, employees)

    drawer.openInactivateDrawer(target.id)
    drawer.closeDrawer()

    expect(drawer.targetSnapshot.value).toBeNull()
    expect(drawer.drawer.value).toEqual({ open: false })
    expect(drawer.detailEmployee.value).toBeNull()
    expect(drawer.isDeactivateModalOpen.value).toBe(false)
  })

  it('clearSnapshot empties the Target without requiring a close', () => {
    const target = employee()
    const employees = ref([target])
    const drawer = useEmployeeDrawer(employees, employees)

    drawer.openDetailDrawer(target.id)
    drawer.clearSnapshot()

    expect(drawer.targetSnapshot.value).toBeNull()
    expect(drawer.detailEmployee.value).toMatchObject({ id: 'emp-1', status: 'ACTIVE' })
  })

  it('captures the Target when opening Remover so the name survives a list refetch', () => {
    const target = employee({ status: 'INACTIVE' })
    const employees = ref([target])
    const drawer = useEmployeeDrawer(employees, employees)

    drawer.openRemoveDrawer(target.id)
    employees.value = []

    expect(drawer.isRemoveModalOpen.value).toBe(true)
    expect(drawer.targetSnapshot.value).toMatchObject({
      id: 'emp-1',
      name: 'Ana Silva',
      status: 'INACTIVE',
    })
  })

  it('keeps the profile after a Remove conflict by falling back to the snapshot', () => {
    const target = employee({ status: 'INACTIVE' })
    const employees = ref([target])
    const drawer = useEmployeeDrawer(employees, employees)

    drawer.openRemoveDrawer(target.id)
    employees.value = []
    drawer.openDetailDrawer(target.id)

    expect(drawer.detailEmployee.value).toMatchObject({
      id: 'emp-1',
      name: 'Ana Silva',
      status: 'INACTIVE',
    })
  })
})
