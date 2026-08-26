import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { EmployeesApi } from '../services/api/employees/types'
import {
  toastMessageForDeactivateError,
  toastMessageForReactivateError,
  useEmployeeLifecycle,
} from './useEmployeeLifecycle'
import { useToast } from './useToast'

const { toasts, dismiss } = useToast()

function dismissAllToasts() {
  for (const toast of [...toasts.value]) {
    dismiss(toast.id)
  }
}

function stubApi(overrides: Partial<EmployeesApi> = {}): EmployeesApi {
  return {
    getEmployees: vi.fn(),
    updateStatus: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  }
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function withLifecycle(
  api: EmployeesApi,
  options: Parameters<typeof useEmployeeLifecycle>[1],
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
  const lifecycle = app.runWithContext(() =>
    scope.run(() => useEmployeeLifecycle(api, options)),
  )
  if (!lifecycle) {
    throw new Error('useEmployeeLifecycle did not return inside the Vue context')
  }
  return {
    lifecycle,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

function httpError(status: number, error?: string) {
  return {
    response: {
      status,
      data: error === undefined ? {} : { error },
    },
  }
}

describe('toastMessageForDeactivateError', () => {
  it('maps Last Admin 409 to the operator copy and does not use the English API string', () => {
    const message = toastMessageForDeactivateError(
      httpError(409, 'Last Admin must stay ACTIVE until another Admin exists'),
    )
    expect(message).toBe(
      'É preciso existir outro Administrador ativo antes desta ação.',
    )
  })

  it('maps 403 to Ação não permitida', () => {
    expect(toastMessageForDeactivateError(httpError(403, 'Action not allowed'))).toBe(
      'Ação não permitida.',
    )
  })

  it('maps 400 and other 409s to the API error string', () => {
    expect(toastMessageForDeactivateError(httpError(400, 'Invalid payload'))).toBe(
      'Invalid payload',
    )
    expect(toastMessageForDeactivateError(httpError(409, 'Something else'))).toBe(
      'Something else',
    )
  })

  it('does not emit a deactivate toast on 401', () => {
    expect(
      toastMessageForDeactivateError(httpError(401, 'Authentication failed')),
    ).toBeNull()
  })

  it('returns the API string for unknown failures when present', () => {
    expect(toastMessageForDeactivateError(httpError(500, 'Internal'))).toBe('Internal')
  })

  it('returns null when there is no API error string', () => {
    expect(toastMessageForDeactivateError(new Error('Network Error'))).toBeNull()
  })
})

describe('useEmployeeLifecycle self vs other Deactivate', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('on Self-Deactivate 200 calls onSelfDeactivated and does not push the generic toast', async () => {
    const onSelfDeactivated = vi.fn()
    const onStatusChanged = vi.fn()
    const result = { id: 'admin-1', status: 'INACTIVE' as const }
    const api = stubApi({
      updateStatus: vi.fn().mockResolvedValue(result),
    })
    const onReactivated = vi.fn()
    const { lifecycle, dispose } = withLifecycle(api, {
      getActorId: () => 'admin-1',
      onSelfDeactivated,
      onStatusChanged,
      onReactivated,
    })

    lifecycle.deactivate('admin-1')
    await flushPromises()

    expect(onSelfDeactivated).toHaveBeenCalledWith(result)
    expect(onStatusChanged).not.toHaveBeenCalled()
    expect(onReactivated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(0)

    dispose()
  })

  it('on Deactivate of another collaborator 200 pushes the generic toast and calls onStatusChanged', async () => {
    const onSelfDeactivated = vi.fn()
    const onStatusChanged = vi.fn()
    const result = { id: 'emp-2', status: 'INACTIVE' as const }
    const api = stubApi({
      updateStatus: vi.fn().mockResolvedValue(result),
    })
    const onReactivated = vi.fn()
    const { lifecycle, dispose } = withLifecycle(api, {
      getActorId: () => 'admin-1',
      onSelfDeactivated,
      onStatusChanged,
      onReactivated,
    })

    lifecycle.deactivate('emp-2')
    await flushPromises()

    expect(onStatusChanged).toHaveBeenCalledWith(result)
    expect(onSelfDeactivated).not.toHaveBeenCalled()
    expect(onReactivated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Colaborador inativado. Você pode reativá-lo pelo perfil.',
    })

    dispose()
  })

  it('on Last Admin 409 does not drop the session and keeps the error toast', async () => {
    const onSelfDeactivated = vi.fn()
    const onStatusChanged = vi.fn()
    const api = stubApi({
      updateStatus: vi.fn().mockRejectedValue({
        response: {
          status: 409,
          data: { error: 'Last Admin must stay ACTIVE until another Admin exists' },
        },
      }),
    })
    const onReactivated = vi.fn()
    const { lifecycle, dispose } = withLifecycle(api, {
      getActorId: () => 'admin-1',
      onSelfDeactivated,
      onStatusChanged,
      onReactivated,
    })

    lifecycle.deactivate('admin-1')
    await flushPromises()

    expect(onSelfDeactivated).not.toHaveBeenCalled()
    expect(onStatusChanged).not.toHaveBeenCalled()
    expect(onReactivated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'É preciso existir outro Administrador ativo antes desta ação.',
    })

    dispose()
  })
})

describe('toastMessageForReactivateError', () => {
  it('maps 403 to Ação não permitida', () => {
    expect(toastMessageForReactivateError(httpError(403, 'Action not allowed'))).toBe(
      'Ação não permitida.',
    )
  })

  it('does not emit a reactivate toast on 401', () => {
    expect(
      toastMessageForReactivateError(httpError(401, 'Authentication failed')),
    ).toBeNull()
  })

  it('maps 400 and 409 to the API error string', () => {
    expect(toastMessageForReactivateError(httpError(400, 'Invalid payload'))).toBe(
      'Invalid payload',
    )
    expect(toastMessageForReactivateError(httpError(409, 'Something else'))).toBe(
      'Something else',
    )
  })

  it('returns the API string for unknown failures when present', () => {
    expect(toastMessageForReactivateError(httpError(500, 'Internal'))).toBe('Internal')
  })

  it('returns null when there is no API error string', () => {
    expect(toastMessageForReactivateError(new Error('Network Error'))).toBeNull()
  })
})

describe('useEmployeeLifecycle reactivate', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls updateStatus with exactly { id, status: ACTIVE } and no actorId', async () => {
    const updateStatus = vi.fn().mockResolvedValue({ id: 'emp-2', status: 'ACTIVE' })
    const api = stubApi({ updateStatus })
    const { lifecycle, dispose } = withLifecycle(api, {
      getActorId: () => 'admin-1',
      onSelfDeactivated: vi.fn(),
      onStatusChanged: vi.fn(),
      onReactivated: vi.fn(),
    })

    lifecycle.reactivate('emp-2')
    await flushPromises()

    expect(updateStatus).toHaveBeenCalledTimes(1)
    expect(updateStatus).toHaveBeenCalledWith({ id: 'emp-2', status: 'ACTIVE' })
    expect(updateStatus.mock.calls[0][0]).not.toHaveProperty('actorId')

    dispose()
  })

  it('on 200 calls onReactivated and pushes the success toast', async () => {
    const onReactivated = vi.fn()
    const onStatusChanged = vi.fn()
    const onSelfDeactivated = vi.fn()
    const result = { id: 'emp-2', status: 'ACTIVE' as const }
    const api = stubApi({
      updateStatus: vi.fn().mockResolvedValue(result),
    })
    const { lifecycle, dispose } = withLifecycle(api, {
      getActorId: () => 'admin-1',
      onSelfDeactivated,
      onStatusChanged,
      onReactivated,
    })

    lifecycle.reactivate('emp-2')
    await flushPromises()

    expect(onReactivated).toHaveBeenCalledWith(result)
    expect(onStatusChanged).not.toHaveBeenCalled()
    expect(onSelfDeactivated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Colaborador reativado (mesma identidade).',
    })

    dispose()
  })

  it('on 403 pushes Ação não permitida and does not call onReactivated', async () => {
    const onReactivated = vi.fn()
    const api = stubApi({
      updateStatus: vi.fn().mockRejectedValue(httpError(403, 'Action not allowed')),
    })
    const { lifecycle, dispose } = withLifecycle(api, {
      getActorId: () => 'admin-1',
      onSelfDeactivated: vi.fn(),
      onStatusChanged: vi.fn(),
      onReactivated,
    })

    lifecycle.reactivate('emp-2')
    await flushPromises()

    expect(onReactivated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Ação não permitida.',
    })

    dispose()
  })
})
