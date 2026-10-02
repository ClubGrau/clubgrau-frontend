import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type {
  UpdateOwnEmployeeDataApi,
  UpdateOwnEmployeeDataResult,
} from '../../services/api/employees/types'
import { ownEmployeeQueryKeys } from '../../services/api/employees/query-keys'
import type { Employee } from '../../types/employee'
import { useToast } from '../useToast'
import {
  toastKeyForUpdateOwnEmployeeDataError,
  toUpdateOwnEmployeeDataParams,
  useUpdateOwnEmployeeData,
} from './useUpdateOwnEmployeeData'

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
  overrides: Partial<Employee.UpdateOwnDataCommand> = {},
): Employee.UpdateOwnDataCommand {
  return {
    name: 'João Silva',
    phone: '+351912345678',
    username: '@joao',
    gender: 'male',
    languages: 'Português',
    emergencyContact: '+351910000000',
    nif: '123456789',
    address: 'Rua do Grau, 10',
    ...overrides,
  }
}

function saved(
  overrides: Partial<UpdateOwnEmployeeDataResult> = {},
): UpdateOwnEmployeeDataResult {
  return {
    employee: {
      id: 'emp-1',
      name: 'João Silva',
      username: 'joao',
      email: 'joao@grau.pt',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      initials: 'JS',
    },
    ...overrides,
  }
}

function withUpdate(
  api: UpdateOwnEmployeeDataApi,
  options: Parameters<typeof useUpdateOwnEmployeeData>[1],
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
    scope.run(() => useUpdateOwnEmployeeData(api, options)),
  )
  if (!composable) {
    throw new Error('useUpdateOwnEmployeeData did not return inside the Vue context')
  }
  return {
    composable,
    queryClient,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toUpdateOwnEmployeeDataParams', () => {
  it('sends the eight writable fields and clears blanks', () => {
    const params = toUpdateOwnEmployeeDataParams(
      command({
        username: '  ',
        gender: '',
        languages: '',
        emergencyContact: '',
        nif: '',
        address: '  ',
      }),
    )

    expect(params).toEqual({
      name: 'João Silva',
      phone: '+351912345678',
      username: null,
      gender: null,
      languages: null,
      emergencyContact: null,
      nif: null,
      address: null,
    })
    expect(params).not.toHaveProperty('email')
    expect(params).not.toHaveProperty('id')
    expect(params).not.toHaveProperty('actorId')
    expect(params).not.toHaveProperty('role')
    expect(params).not.toHaveProperty('status')
    expect(params).not.toHaveProperty('password')
  })

  it('strips a leading @ from username', () => {
    expect(toUpdateOwnEmployeeDataParams(command()).username).toBe('joao')
  })
})

describe('toastKeyForUpdateOwnEmployeeDataError', () => {
  it('maps 400 to the validation key and does not use the English API string', () => {
    expect(
      toastKeyForUpdateOwnEmployeeDataError(httpError(400, 'Invalid param nif')),
    ).toBe('ProfileCard.toast.validation')
  })

  it('does not emit a toast on 401', () => {
    expect(
      toastKeyForUpdateOwnEmployeeDataError(httpError(401, 'Authentication failed')),
    ).toBeNull()
  })

  it('maps unexpected failures to the generic key', () => {
    expect(toastKeyForUpdateOwnEmployeeDataError(httpError(500, 'boom'))).toBe(
      'ProfileCard.toast.unexpected',
    )
  })
})

describe('useUpdateOwnEmployeeData', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('writes the read model into the own-employee cache and returns a reissued token', async () => {
    const result = saved({ token: 'reissued' })
    const onUpdated = vi.fn()
    const { composable, queryClient, dispose } = withUpdate(
      { updateOwnEmployeeData: vi.fn().mockResolvedValue(result) },
      { onUpdated, onUnauthorized: vi.fn() },
    )

    composable.updateOwnEmployeeData(command())
    await flushPromises()

    expect(onUpdated).toHaveBeenCalledWith(result)
    expect(queryClient.getQueryData(ownEmployeeQueryKeys.me)).toEqual(result.employee)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Dados atualizados.',
    })

    dispose()
  })

  it('on 401 calls onUnauthorized and does not toast the English error', async () => {
    const onUpdated = vi.fn()
    const onUnauthorized = vi.fn()
    const { composable, dispose } = withUpdate(
      {
        updateOwnEmployeeData: vi
          .fn()
          .mockRejectedValue(httpError(401, 'Authentication failed')),
      },
      { onUpdated, onUnauthorized },
    )

    composable.updateOwnEmployeeData(command())
    await flushPromises()

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(onUpdated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(0)

    dispose()
  })
})
