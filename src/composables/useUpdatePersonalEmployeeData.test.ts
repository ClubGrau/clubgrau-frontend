import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type {
  UpdateEmployeeSectionResult,
  UpdatePersonalEmployeeDataApi,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import {
  hasPersonalEmployeeDataChanges,
  toastKeyForUpdatePersonalDataError,
  toUpdatePersonalEmployeeDataParams,
  useUpdatePersonalEmployeeData,
  type PersonalEmployeeDataSnapshot,
} from './useUpdatePersonalEmployeeData'
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
  overrides: Partial<Employee.UpdatePersonalDataCommand> = {},
): Employee.UpdatePersonalDataCommand {
  return {
    id: 'emp-1',
    gender: '',
    languages: 'Português',
    emergencyContact: '',
    nif: '',
    address: '',
    ...overrides,
  }
}

function original(
  overrides: Partial<PersonalEmployeeDataSnapshot> = {},
): PersonalEmployeeDataSnapshot {
  return {
    gender: undefined,
    languages: 'Português',
    emergencyContact: undefined,
    nif: undefined,
    address: undefined,
    ...overrides,
  }
}

function updateInput(
  commandOverrides: Partial<Employee.UpdatePersonalDataCommand> = {},
  originalOverrides: Partial<PersonalEmployeeDataSnapshot> = {},
) {
  return { command: command(commandOverrides), original: original(originalOverrides) }
}

function updated(): UpdateEmployeeSectionResult {
  return { id: 'emp-1' }
}

function withUpdatePersonal(
  api: UpdatePersonalEmployeeDataApi,
  options: Parameters<typeof useUpdatePersonalEmployeeData>[1],
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
    scope.run(() => useUpdatePersonalEmployeeData(api, options)),
  )
  if (!composable) {
    throw new Error('useUpdatePersonalEmployeeData did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toUpdatePersonalEmployeeDataParams', () => {
  it('sends only changed fields in a sparse PATCH', () => {
    const params = toUpdatePersonalEmployeeDataParams(
      command({ gender: 'male' }),
      original(),
    )

    expect(params).toEqual({
      id: 'emp-1',
      gender: 'male',
    })
  })

  it('sends null to clear gender when Não informado is selected', () => {
    const params = toUpdatePersonalEmployeeDataParams(
      command({ gender: '' }),
      original({ gender: 'male' }),
    )

    expect(params).toEqual({
      id: 'emp-1',
      gender: null,
    })
  })

  it('sends null to clear nif when the field is emptied', () => {
    const params = toUpdatePersonalEmployeeDataParams(
      command({ nif: '  ' }),
      original({ nif: '123456789' }),
    )

    expect(params).toEqual({
      id: 'emp-1',
      nif: null,
    })
  })
})

describe('hasPersonalEmployeeDataChanges', () => {
  it('returns false when only id is present', () => {
    expect(hasPersonalEmployeeDataChanges({ id: 'emp-1' })).toBe(false)
  })
})

describe('toastKeyForUpdatePersonalDataError', () => {
  it('maps 409 to the updateConflict key', () => {
    expect(toastKeyForUpdatePersonalDataError(httpError(409, 'Employee is removed'))).toBe(
      'Employees.toast.updateConflict',
    )
  })

  it('does not emit a toast on 401', () => {
    expect(toastKeyForUpdatePersonalDataError(httpError(401, 'Authentication failed'))).toBeNull()
  })
})

describe('useUpdatePersonalEmployeeData', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls updatePersonalData without actorId and shows success toast', async () => {
    const onUpdated = vi.fn()
    const updatePersonalData = vi.fn().mockResolvedValue(updated())
    const { composable, dispose } = withUpdatePersonal({ updatePersonalData }, { onUpdated })

    composable.updatePersonal(updateInput({ gender: 'male' }))
    await flushPromises()

    expect(updatePersonalData).toHaveBeenCalledWith(
      toUpdatePersonalEmployeeDataParams(command({ gender: 'male' }), original()),
    )
    expect(updatePersonalData.mock.calls[0][0]).not.toHaveProperty('actorId')
    expect(onUpdated).toHaveBeenCalledWith(updated())
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Informações pessoais atualizadas.',
    })

    dispose()
  })

  it('does not call the API when nothing changed', async () => {
    const onUpdated = vi.fn()
    const updatePersonalData = vi.fn()
    const { composable, dispose } = withUpdatePersonal({ updatePersonalData }, { onUpdated })

    composable.updatePersonal(updateInput())
    await flushPromises()

    expect(updatePersonalData).not.toHaveBeenCalled()
    expect(onUpdated).not.toHaveBeenCalled()

    dispose()
  })
})
