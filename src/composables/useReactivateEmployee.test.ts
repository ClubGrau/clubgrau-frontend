import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { UpdateEmployeeStatusApi } from '../services/api/employees/types'
import {
  toastKeyForReactivateError,
  useReactivateEmployee,
} from './useReactivateEmployee'
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

function withReactivate(
  api: UpdateEmployeeStatusApi,
  options: Parameters<typeof useReactivateEmployee>[1],
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
    scope.run(() => useReactivateEmployee(api, options)),
  )
  if (!composable) {
    throw new Error('useReactivateEmployee did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toastKeyForReactivateError', () => {
  it('maps 403 to the forbidden key', () => {
    expect(toastKeyForReactivateError(httpError(403, 'Action not allowed'))).toBe(
      'Employees.toast.forbidden',
    )
  })

  it('does not emit a reactivate toast on 401', () => {
    expect(
      toastKeyForReactivateError(httpError(401, 'Authentication failed')),
    ).toBeNull()
  })

  it('maps 400 and 409 to the unexpected key', () => {
    expect(toastKeyForReactivateError(httpError(400, 'Invalid payload'))).toBe(
      'Employees.toast.unexpected',
    )
    expect(toastKeyForReactivateError(httpError(409, 'Something else'))).toBe(
      'Employees.toast.unexpected',
    )
  })

  it('maps unknown failures with an API string to the unexpected key', () => {
    expect(toastKeyForReactivateError(httpError(500, 'Internal'))).toBe(
      'Employees.toast.unexpected',
    )
  })

  it('returns null when there is no API error string', () => {
    expect(toastKeyForReactivateError(new Error('Network Error'))).toBeNull()
  })
})

describe('useReactivateEmployee', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls updateStatus with exactly { id, status: ACTIVE } and no actorId', async () => {
    const updateStatus = vi.fn().mockResolvedValue({ id: 'emp-2', status: 'ACTIVE' })
    const { composable, dispose } = withReactivate(
      { updateStatus },
      { onReactivated: vi.fn() },
    )

    composable.reactivate('emp-2')
    await flushPromises()

    expect(updateStatus).toHaveBeenCalledTimes(1)
    expect(updateStatus).toHaveBeenCalledWith({ id: 'emp-2', status: 'ACTIVE' })
    expect(updateStatus.mock.calls[0][0]).not.toHaveProperty('actorId')

    dispose()
  })

  it('on 200 calls onReactivated and pushes the success toast', async () => {
    const onReactivated = vi.fn()
    const result = { id: 'emp-2', status: 'ACTIVE' as const }
    const { composable, dispose } = withReactivate(
      { updateStatus: vi.fn().mockResolvedValue(result) },
      { onReactivated },
    )

    composable.reactivate('emp-2')
    await flushPromises()

    expect(onReactivated).toHaveBeenCalledWith(result)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Colaborador reativado (mesma identidade).',
    })

    dispose()
  })

  it('on 403 pushes Ação não permitida and does not call onReactivated', async () => {
    const onReactivated = vi.fn()
    const { composable, dispose } = withReactivate(
      { updateStatus: vi.fn().mockRejectedValue(httpError(403, 'Action not allowed')) },
      { onReactivated },
    )

    composable.reactivate('emp-2')
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
