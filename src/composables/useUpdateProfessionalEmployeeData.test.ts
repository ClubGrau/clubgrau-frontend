import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type {
  UpdateEmployeeSectionResult,
  UpdateProfessionalEmployeeDataApi,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import {
  toastKeyForUpdateProfessionalDataError,
  toUpdateProfessionalEmployeeDataParams,
  useUpdateProfessionalEmployeeData,
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

function payload(
  overrides: Partial<Employee.UpdateProfessionalDataCommand> = {},
): Employee.UpdateProfessionalDataCommand {
  return {
    id: 'emp-1',
    role: 'EMPLOYEE',
    jobTitle: 'Barbeiro',
    employmentId: 'EMP-001',
    status: 'VACATION',
    ...overrides,
  }
}

function updated(): UpdateEmployeeSectionResult {
  return { id: 'emp-1' }
}

function withUpdateProfessional(
  api: UpdateProfessionalEmployeeDataApi,
  options: Parameters<typeof useUpdateProfessionalEmployeeData>[1],
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
    scope.run(() => useUpdateProfessionalEmployeeData(api, options)),
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
  it('sends the form status on the professional-data payload', () => {
    expect(toUpdateProfessionalEmployeeDataParams(payload())).toEqual({
      id: 'emp-1',
      role: 'EMPLOYEE',
      jobTitle: 'Barbeiro',
      employmentId: 'EMP-001',
      status: 'VACATION',
    })
  })

  it('keeps ACTIVE and INACTIVE as sendable statuses', () => {
    expect(toUpdateProfessionalEmployeeDataParams(payload({ status: 'ACTIVE' })).status).toBe(
      'ACTIVE',
    )
    expect(toUpdateProfessionalEmployeeDataParams(payload({ status: 'INACTIVE' })).status).toBe(
      'INACTIVE',
    )
  })

  it('trims role and omits blank job fields', () => {
    expect(
      toUpdateProfessionalEmployeeDataParams(
        payload({ role: '  MANAGER  ', jobTitle: '  ', employmentId: '' }),
      ),
    ).toEqual({
      id: 'emp-1',
      role: 'MANAGER',
      status: 'VACATION',
    })
  })
})

describe('toastKeyForUpdateProfessionalDataError', () => {
  it('maps Last Admin 409 to the lastAdmin key', () => {
    expect(
      toastKeyForUpdateProfessionalDataError(
        httpError(409, 'Last Admin must stay ACTIVE until another Admin exists'),
      ),
    ).toBe('Employees.toast.lastAdmin')
  })

  it('maps lifecycle 403 to the forbidden key', () => {
    expect(toastKeyForUpdateProfessionalDataError(httpError(403, 'Action not allowed'))).toBe(
      'Employees.toast.forbidden',
    )
  })
})

describe('useUpdateProfessionalEmployeeData', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls updateProfessionalData with status and reports it on success', async () => {
    const onUpdated = vi.fn()
    const updateProfessionalData = vi.fn().mockResolvedValue(updated())
    const { composable, dispose } = withUpdateProfessional(
      { updateProfessionalData },
      { onUpdated },
    )

    composable.updateProfessional(payload())
    await flushPromises()

    expect(updateProfessionalData).toHaveBeenCalledWith({
      id: 'emp-1',
      role: 'EMPLOYEE',
      jobTitle: 'Barbeiro',
      employmentId: 'EMP-001',
      status: 'VACATION',
    })
    expect(updateProfessionalData.mock.calls[0][0]).not.toHaveProperty('actorId')
    expect(onUpdated).toHaveBeenCalledWith({ id: 'emp-1', status: 'VACATION' })

    dispose()
  })
})
