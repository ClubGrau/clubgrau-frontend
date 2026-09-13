import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type {
  UpdateEmployeeSectionResult,
  UpdateMainEmployeeDataApi,
} from '../services/api/employees/types'
import type { Employee } from '../types/employee'
import {
  hasMainEmployeeDataChanges,
  toastKeyForUpdateMainDataError,
  toUpdateMainEmployeeDataParams,
  useUpdateMainEmployeeData,
  type MainEmployeeDataSnapshot,
} from './useUpdateMainEmployeeData'
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
  overrides: Partial<Employee.UpdateMainDataCommand> = {},
): Employee.UpdateMainDataCommand {
  return {
    id: 'emp-1',
    name: 'João Silva',
    email: 'joao@grau.pt',
    phone: '+351912345678',
    username: '@joaosilva',
    ...overrides,
  }
}

function original(
  overrides: Partial<MainEmployeeDataSnapshot> = {},
): MainEmployeeDataSnapshot {
  return {
    name: 'João Silva',
    email: 'joao@grau.pt',
    phone: '+351912345678',
    username: 'joaosilva',
    ...overrides,
  }
}

function updateInput(
  commandOverrides: Partial<Employee.UpdateMainDataCommand> = {},
  originalOverrides: Partial<MainEmployeeDataSnapshot> = {},
) {
  return { command: payload(commandOverrides), original: original(originalOverrides) }
}

function updated(): UpdateEmployeeSectionResult {
  return { id: 'emp-1' }
}

function withUpdateMain(
  api: UpdateMainEmployeeDataApi,
  options: Parameters<typeof useUpdateMainEmployeeData>[1],
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
    scope.run(() => useUpdateMainEmployeeData(api, options)),
  )
  if (!composable) {
    throw new Error('useUpdateMainEmployeeData did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toUpdateMainEmployeeDataParams', () => {
  it('sends only changed fields in a sparse PATCH', () => {
    const params = toUpdateMainEmployeeDataParams(
      payload({ name: 'Maria Santos' }),
      original(),
    )

    expect(params).toEqual({
      id: 'emp-1',
      name: 'Maria Santos',
    })
  })

  it('strips leading @ from username when it changed', () => {
    const params = toUpdateMainEmployeeDataParams(
      payload({ username: '@novo' }),
      original(),
    )

    expect(params).toEqual({
      id: 'emp-1',
      username: 'novo',
    })
  })

  it('sends null to clear username when it was removed from the form', () => {
    const params = toUpdateMainEmployeeDataParams(
      payload({ username: '  ' }),
      original(),
    )

    expect(params).toEqual({
      id: 'emp-1',
      username: null,
    })
  })

  it('omits username when it stayed empty', () => {
    const params = toUpdateMainEmployeeDataParams(
      payload({ name: 'Maria Santos', username: '' }),
      original({ username: undefined }),
    )

    expect(params).toEqual({
      id: 'emp-1',
      name: 'Maria Santos',
    })
  })
})

describe('hasMainEmployeeDataChanges', () => {
  it('returns false when only id is present', () => {
    expect(hasMainEmployeeDataChanges({ id: 'emp-1' })).toBe(false)
  })
})

describe('toastKeyForUpdateMainDataError', () => {
  it('maps 409 to the emailInUse key', () => {
    expect(toastKeyForUpdateMainDataError(httpError(409, 'Email already in use'))).toBe(
      'Employees.toast.emailInUse',
    )
  })

  it('maps 400 to the updateValidation key', () => {
    expect(toastKeyForUpdateMainDataError(httpError(400, 'Invalid payload'))).toBe(
      'Employees.toast.updateValidation',
    )
  })

  it('does not emit a toast on 401', () => {
    expect(toastKeyForUpdateMainDataError(httpError(401, 'Authentication failed'))).toBeNull()
  })
})

describe('useUpdateMainEmployeeData', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls updateMainData without actorId and shows success toast', async () => {
    const onUpdated = vi.fn()
    const updateMainData = vi.fn().mockResolvedValue(updated())
    const { composable, dispose } = withUpdateMain({ updateMainData }, { onUpdated })

    composable.updateMain(updateInput({ name: 'Maria Santos' }))
    await flushPromises()

    expect(updateMainData).toHaveBeenCalledWith(
      toUpdateMainEmployeeDataParams(payload({ name: 'Maria Santos' }), original()),
    )
    expect(updateMainData.mock.calls[0][0]).not.toHaveProperty('actorId')
    expect(onUpdated).toHaveBeenCalledWith(updated())
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Dados principais atualizados.',
    })

    dispose()
  })

  it('does not call the API when nothing changed', async () => {
    const onUpdated = vi.fn()
    const updateMainData = vi.fn()
    const { composable, dispose } = withUpdateMain({ updateMainData }, { onUpdated })

    composable.updateMain(updateInput())
    await flushPromises()

    expect(updateMainData).not.toHaveBeenCalled()
    expect(onUpdated).not.toHaveBeenCalled()

    dispose()
  })

  it('on 409 pushes e-mail em uso and does not call onUpdated', async () => {
    const onUpdated = vi.fn()
    const { composable, dispose } = withUpdateMain(
      { updateMainData: vi.fn().mockRejectedValue(httpError(409, 'Email already in use')) },
      { onUpdated },
    )

    composable.updateMain(updateInput({ name: 'Maria Santos' }))
    await flushPromises()

    expect(onUpdated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Este e-mail já está em uso.',
    })

    dispose()
  })
})
