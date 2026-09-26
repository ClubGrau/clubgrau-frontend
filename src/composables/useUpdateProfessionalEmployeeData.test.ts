import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type {
  UpdateEmployeeSectionResult,
  UpdateProfessionalEmployeeDataApi,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import {
  hasProfessionalEmployeeDataChanges,
  toastKeyForUpdateProfessionalDataError,
  toUpdateProfessionalEmployeeDataParams,
  useUpdateProfessionalEmployeeData,
  type ProfessionalEmployeeDataSnapshot,
} from './useUpdateProfessionalEmployeeData'
import { useToast } from './useToast'

const { toasts, dismiss } = useToast()

function dismissAllToasts() {
  for (const toast of [...toasts.value]) {
    dismiss(toast.id)
  }
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function httpError(status: number, error?: string) {
  return {
    response: {
      status,
      data: error === undefined ? {} : { error },
    },
  }
}

function command(
  overrides: Partial<Employee.UpdateProfessionalDataCommand> = {},
): Employee.UpdateProfessionalDataCommand {
  return {
    id: 'emp-1',
    role: 'EMPLOYEE',
    jobTitle: 'Barbeiro',
    status: 'ACTIVE',
    ...overrides,
  }
}

function original(
  overrides: Partial<ProfessionalEmployeeDataSnapshot> = {},
): ProfessionalEmployeeDataSnapshot {
  return {
    role: 'EMPLOYEE',
    jobTitle: 'Barbeiro',
    status: 'ACTIVE',
    ...overrides,
  }
}

function updateInput(
  commandOverrides: Partial<Employee.UpdateProfessionalDataCommand> = {},
  originalOverrides: Partial<ProfessionalEmployeeDataSnapshot> = {},
) {
  return { command: command(commandOverrides), original: original(originalOverrides) }
}

function updated(): UpdateEmployeeSectionResult {
  return { id: 'emp-1' }
}

function withUpdateProfessional(
  api: UpdateProfessionalEmployeeDataApi,
  options: Partial<Parameters<typeof useUpdateProfessionalEmployeeData>[1]> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: false },
    },
  })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() =>
    scope.run(() =>
      useUpdateProfessionalEmployeeData(api, {
        getActorId: () => null,
        onUpdated: vi.fn(),
        onSelfDeactivated: vi.fn(),
        ...options,
      }),
    ),
  )
  if (!composable) {
    throw new Error('useUpdateProfessionalEmployeeData did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toUpdateProfessionalEmployeeDataParams', () => {
  it('sends only a changed job title and omits echoed role and status', () => {
    const params = toUpdateProfessionalEmployeeDataParams(
      command({ jobTitle: 'Barbeiro sénior' }),
      original(),
    )

    expect(params).toEqual({
      id: 'emp-1',
      jobTitle: 'Barbeiro sénior',
    })
    expect(params).not.toHaveProperty('role')
    expect(params).not.toHaveProperty('status')
    expect(params).not.toHaveProperty('employmentId')
    expect(params).not.toHaveProperty('actorId')
  })

  it('sends null to clear job title when the field is emptied', () => {
    const params = toUpdateProfessionalEmployeeDataParams(
      command({ jobTitle: '  ' }),
      original({ jobTitle: 'Barbeiro' }),
    )

    expect(params).toEqual({
      id: 'emp-1',
      jobTitle: null,
    })
  })

  it('sends role and status only when they differ from the target', () => {
    const params = toUpdateProfessionalEmployeeDataParams(
      command({ role: 'MANAGER', status: 'VACATION' }),
      original(),
    )

    expect(params).toEqual({
      id: 'emp-1',
      role: 'MANAGER',
      status: 'VACATION',
    })
  })
})

describe('hasProfessionalEmployeeDataChanges', () => {
  it('returns false when only id is present', () => {
    expect(hasProfessionalEmployeeDataChanges({ id: 'emp-1' })).toBe(false)
  })
})

describe('toastKeyForUpdateProfessionalDataError', () => {
  it('maps 403 to the forbidden key', () => {
    expect(toastKeyForUpdateProfessionalDataError(httpError(403, 'Action not allowed'))).toBe(
      'Employees.toast.forbidden',
    )
  })

  it('maps Last Admin 409 to the lastAdmin key', () => {
    expect(
      toastKeyForUpdateProfessionalDataError(
        httpError(409, 'Last Admin must stay ACTIVE until another Admin exists'),
      ),
    ).toBe('Employees.toast.lastAdmin')
  })

  it('maps a removed target to the updateConflict key', () => {
    expect(
      toastKeyForUpdateProfessionalDataError(httpError(409, 'Employee is already removed')),
    ).toBe('Employees.toast.updateConflict')
  })

  it('does not emit a toast on 401', () => {
    expect(toastKeyForUpdateProfessionalDataError(httpError(401, 'Authentication failed'))).toBeNull()
  })
})

describe('useUpdateProfessionalEmployeeData', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls updateProfessionalData without actorId and shows success toast', async () => {
    const onUpdated = vi.fn()
    const onSelfDeactivated = vi.fn()
    const updateProfessionalData = vi.fn().mockResolvedValue(updated())
    const { composable, dispose } = withUpdateProfessional(
      { updateProfessionalData },
      { onUpdated, onSelfDeactivated },
    )

    composable.updateProfessional(updateInput({ jobTitle: 'Barbeiro sénior' }))
    await flushPromises()

    expect(updateProfessionalData).toHaveBeenCalledWith(
      toUpdateProfessionalEmployeeDataParams(
        command({ jobTitle: 'Barbeiro sénior' }),
        original(),
      ),
    )
    expect(updateProfessionalData.mock.calls[0][0]).not.toHaveProperty('actorId')
    expect(updateProfessionalData.mock.calls[0][0]).not.toHaveProperty('employmentId')
    expect(onUpdated).toHaveBeenCalledWith(updated(), undefined)
    expect(onSelfDeactivated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Informações profissionais atualizadas.',
    })

    dispose()
  })

  it('does not call the API when role and status are only echoed', async () => {
    const onUpdated = vi.fn()
    const updateProfessionalData = vi.fn()
    const { composable, dispose } = withUpdateProfessional(
      { updateProfessionalData },
      { onUpdated },
    )

    composable.updateProfessional(updateInput())
    await flushPromises()

    expect(updateProfessionalData).not.toHaveBeenCalled()
    expect(onUpdated).not.toHaveBeenCalled()

    dispose()
  })

  it('passes the new status so the detail badge can leave the captured snapshot', async () => {
    const onUpdated = vi.fn()
    const updateProfessionalData = vi.fn().mockResolvedValue(updated())
    const { composable, dispose } = withUpdateProfessional(
      { updateProfessionalData },
      { onUpdated },
    )

    composable.updateProfessional(updateInput({ status: 'VACATION' }))
    await flushPromises()

    expect(onUpdated).toHaveBeenCalledWith(updated(), 'VACATION')

    dispose()
  })

  it('logs the actor out when they set their own status to INACTIVE', async () => {
    const onUpdated = vi.fn()
    const onSelfDeactivated = vi.fn()
    const updateProfessionalData = vi.fn().mockResolvedValue(updated())
    const { composable, dispose } = withUpdateProfessional(
      { updateProfessionalData },
      { getActorId: () => 'emp-1', onUpdated, onSelfDeactivated },
    )

    composable.updateProfessional(updateInput({ status: 'INACTIVE' }))
    await flushPromises()

    expect(updateProfessionalData).toHaveBeenCalledWith({
      id: 'emp-1',
      status: 'INACTIVE',
    })
    expect(onSelfDeactivated).toHaveBeenCalledWith(updated())
    expect(onUpdated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(0)

    dispose()
  })
})
