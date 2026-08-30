import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { UpdateEmployeeStatusApi } from '../services/api/employees/types'
import {
  toastKeyForDeactivateError,
  useDeactivateEmployee,
} from './useDeactivateEmployee'
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

function withDeactivate(
  api: UpdateEmployeeStatusApi,
  options: Parameters<typeof useDeactivateEmployee>[1],
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
    scope.run(() => useDeactivateEmployee(api, options)),
  )
  if (!composable) {
    throw new Error('useDeactivateEmployee did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toastKeyForDeactivateError', () => {
  it('maps Last Admin 409 to the lastAdmin key and does not use the English API string', () => {
    const key = toastKeyForDeactivateError(
      httpError(409, 'Last Admin must stay ACTIVE until another Admin exists'),
    )
    expect(key).toBe('Employees.toast.lastAdmin')
  })

  it('maps 403 to the forbidden key', () => {
    expect(toastKeyForDeactivateError(httpError(403, 'Action not allowed'))).toBe(
      'Employees.toast.forbidden',
    )
  })

  it('maps 400 and other 409s to the unexpected key', () => {
    expect(toastKeyForDeactivateError(httpError(400, 'Invalid payload'))).toBe(
      'Employees.toast.unexpected',
    )
    expect(toastKeyForDeactivateError(httpError(409, 'Something else'))).toBe(
      'Employees.toast.unexpected',
    )
  })

  it('does not emit a deactivate toast on 401', () => {
    expect(
      toastKeyForDeactivateError(httpError(401, 'Authentication failed')),
    ).toBeNull()
  })

  it('maps unknown failures with an API string to the unexpected key', () => {
    expect(toastKeyForDeactivateError(httpError(500, 'Internal'))).toBe(
      'Employees.toast.unexpected',
    )
  })

  it('returns null when there is no API error string', () => {
    expect(toastKeyForDeactivateError(new Error('Network Error'))).toBeNull()
  })
})

describe('useDeactivateEmployee self vs other', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('on Self-Deactivate 200 calls onSelfDeactivated and does not push the generic toast', async () => {
    const onSelfDeactivated = vi.fn()
    const onStatusChanged = vi.fn()
    const result = { id: 'admin-1', status: 'INACTIVE' as const }
    const api: UpdateEmployeeStatusApi = {
      updateStatus: vi.fn().mockResolvedValue(result),
    }
    const { composable, dispose } = withDeactivate(api, {
      getActorId: () => 'admin-1',
      onSelfDeactivated,
      onStatusChanged,
    })

    composable.deactivate('admin-1')
    await flushPromises()

    expect(onSelfDeactivated).toHaveBeenCalledWith(result)
    expect(onStatusChanged).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(0)

    dispose()
  })

  it('on Deactivate of another collaborator 200 pushes the generic toast and calls onStatusChanged', async () => {
    const onSelfDeactivated = vi.fn()
    const onStatusChanged = vi.fn()
    const result = { id: 'emp-2', status: 'INACTIVE' as const }
    const api: UpdateEmployeeStatusApi = {
      updateStatus: vi.fn().mockResolvedValue(result),
    }
    const { composable, dispose } = withDeactivate(api, {
      getActorId: () => 'admin-1',
      onSelfDeactivated,
      onStatusChanged,
    })

    composable.deactivate('emp-2')
    await flushPromises()

    expect(onStatusChanged).toHaveBeenCalledWith(result)
    expect(onSelfDeactivated).not.toHaveBeenCalled()
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
    const api: UpdateEmployeeStatusApi = {
      updateStatus: vi.fn().mockRejectedValue({
        response: {
          status: 409,
          data: { error: 'Last Admin must stay ACTIVE until another Admin exists' },
        },
      }),
    }
    const { composable, dispose } = withDeactivate(api, {
      getActorId: () => 'admin-1',
      onSelfDeactivated,
      onStatusChanged,
    })

    composable.deactivate('admin-1')
    await flushPromises()

    expect(onSelfDeactivated).not.toHaveBeenCalled()
    expect(onStatusChanged).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'É preciso existir outro Administrador ativo antes desta ação.',
    })

    dispose()
  })
})
