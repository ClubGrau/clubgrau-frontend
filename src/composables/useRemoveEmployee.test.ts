import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { RemoveEmployeeApi } from '../services/api/employees/types'
import { toastKeyForRemoveError, useRemoveEmployee } from './useRemoveEmployee'
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

function withRemove(
  api: RemoveEmployeeApi,
  options: Parameters<typeof useRemoveEmployee>[1],
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
    scope.run(() => useRemoveEmployee(api, options)),
  )
  if (!composable) {
    throw new Error('useRemoveEmployee did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toastKeyForRemoveError', () => {
  it('does not emit a remove toast on 401', () => {
    expect(toastKeyForRemoveError(httpError(401, 'Authentication failed'))).toBeNull()
  })

  it('maps 403 to the forbidden key', () => {
    expect(toastKeyForRemoveError(httpError(403, 'Action not allowed'))).toBe(
      'Employees.toast.forbidden',
    )
  })

  it('maps Last Admin 409 to the lastAdmin key and does not use the English API string', () => {
    const key = toastKeyForRemoveError(
      httpError(409, 'Last Admin must stay ACTIVE until another Admin exists'),
    )
    expect(key).toBe('Employees.toast.lastAdmin')
  })

  it('maps NOT_INACTIVE and ALREADY_REMOVED 409s to the unexpected key', () => {
    expect(toastKeyForRemoveError(httpError(409, 'Employee is not inactive'))).toBe(
      'Employees.toast.unexpected',
    )
    expect(
      toastKeyForRemoveError(httpError(409, 'Employee is already removed')),
    ).toBe('Employees.toast.unexpected')
  })

  it('maps 400 and other 409s to the unexpected key', () => {
    expect(toastKeyForRemoveError(httpError(400, 'Invalid payload'))).toBe(
      'Employees.toast.unexpected',
    )
    expect(toastKeyForRemoveError(httpError(409, 'Something else'))).toBe(
      'Employees.toast.unexpected',
    )
  })

  it('maps unknown failures with an API string to the unexpected key', () => {
    expect(toastKeyForRemoveError(httpError(500, 'Internal'))).toBe(
      'Employees.toast.unexpected',
    )
  })

  it('returns null when there is no API error string', () => {
    expect(toastKeyForRemoveError(new Error('Network Error'))).toBeNull()
  })
})

describe('useRemoveEmployee', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls remove with exactly { id, password } and no actorId', async () => {
    const remove = vi.fn().mockResolvedValue({ id: 'emp-2' })
    const { composable, dispose } = withRemove(
      { remove },
      { onRemoved: vi.fn(), onRemoveConflict: vi.fn() },
    )

    composable.remove({ id: 'emp-2', password: 'secret' })
    await flushPromises()

    expect(remove).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith({ id: 'emp-2', password: 'secret' })
    expect(remove.mock.calls[0][0]).not.toHaveProperty('actorId')

    dispose()
  })

  it('does not call the API when id or password is empty', async () => {
    const remove = vi.fn()
    const { composable, dispose } = withRemove(
      { remove },
      { onRemoved: vi.fn(), onRemoveConflict: vi.fn() },
    )

    composable.remove({ id: '', password: 'secret' })
    composable.remove({ id: 'emp-2', password: '' })
    await flushPromises()

    expect(remove).not.toHaveBeenCalled()

    dispose()
  })

  it('on 200 calls onRemoved and pushes the success toast', async () => {
    const onRemoved = vi.fn()
    const onRemoveConflict = vi.fn()
    const result = { id: 'emp-2' }
    const { composable, dispose } = withRemove(
      { remove: vi.fn().mockResolvedValue(result) },
      { onRemoved, onRemoveConflict },
    )

    composable.remove({ id: 'emp-2', password: 'secret' })
    await flushPromises()

    expect(onRemoved).toHaveBeenCalledWith(result)
    expect(onRemoveConflict).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Saiu da equipe. O email original está livre para um cadastro novo.',
    })
    expect(composable.removeError.value).toBeNull()

    dispose()
  })

  it('on 401 sets the opaque modal error, stays without toast, and does not call callbacks', async () => {
    const onRemoved = vi.fn()
    const onRemoveConflict = vi.fn()
    const { composable, dispose } = withRemove(
      { remove: vi.fn().mockRejectedValue(httpError(401, 'Authentication failed')) },
      { onRemoved, onRemoveConflict },
    )

    composable.remove({ id: 'emp-2', password: 'wrong' })
    await flushPromises()

    expect(onRemoved).not.toHaveBeenCalled()
    expect(onRemoveConflict).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(0)
    expect(composable.removeError.value).toBe(
      'Não foi possível confirmar a sua identidade. Verifique a palavra-passe.',
    )

    dispose()
  })

  it('on Last Admin 409 toasts the operator copy and calls onRemoveConflict', async () => {
    const onRemoved = vi.fn()
    const onRemoveConflict = vi.fn()
    const { composable, dispose } = withRemove(
      {
        remove: vi.fn().mockRejectedValue(
          httpError(409, 'Last Admin must stay ACTIVE until another Admin exists'),
        ),
      },
      { onRemoved, onRemoveConflict },
    )

    composable.remove({ id: 'emp-2', password: 'secret' })
    await flushPromises()

    expect(onRemoved).not.toHaveBeenCalled()
    expect(onRemoveConflict).toHaveBeenCalledWith('emp-2')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'É preciso existir outro Administrador ativo antes desta ação.',
    })
    expect(composable.removeError.value).toBeNull()

    dispose()
  })

  it('on 403 toasts Ação não permitida and calls onRemoveConflict', async () => {
    const onRemoved = vi.fn()
    const onRemoveConflict = vi.fn()
    const { composable, dispose } = withRemove(
      { remove: vi.fn().mockRejectedValue(httpError(403, 'Action not allowed')) },
      { onRemoved, onRemoveConflict },
    )

    composable.remove({ id: 'emp-2', password: 'secret' })
    await flushPromises()

    expect(onRemoved).not.toHaveBeenCalled()
    expect(onRemoveConflict).toHaveBeenCalledWith('emp-2')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Ação não permitida.',
    })

    dispose()
  })

  it('on NOT_INACTIVE 409 toasts the unexpected copy and calls onRemoveConflict', async () => {
    const onRemoved = vi.fn()
    const onRemoveConflict = vi.fn()
    const { composable, dispose } = withRemove(
      { remove: vi.fn().mockRejectedValue(httpError(409, 'Employee is not inactive')) },
      { onRemoved, onRemoveConflict },
    )

    composable.remove({ id: 'emp-2', password: 'secret' })
    await flushPromises()

    expect(onRemoved).not.toHaveBeenCalled()
    expect(onRemoveConflict).toHaveBeenCalledWith('emp-2')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Não foi possível concluir a ação. Tente novamente.',
    })

    dispose()
  })
})
