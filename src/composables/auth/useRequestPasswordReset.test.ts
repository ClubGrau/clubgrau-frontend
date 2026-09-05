import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { RequestPasswordResetApi } from '../../services/api/auth/types'
import { useToast } from '../useToast'
import {
  toastKeyForEmailIssue,
  toastKeyForRequestPasswordResetError,
  useRequestPasswordReset,
} from './useRequestPasswordReset'

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

function withReset(api: RequestPasswordResetApi) {
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
    scope.run(() => useRequestPasswordReset(api)),
  )
  if (!composable) {
    throw new Error('useRequestPasswordReset did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toastKeyForEmailIssue', () => {
  it('maps empty and invalid to ForgotPassword toast keys', () => {
    expect(toastKeyForEmailIssue('empty')).toBe('ForgotPassword.toast.emailRequired')
    expect(toastKeyForEmailIssue('invalid')).toBe('ForgotPassword.toast.emailInvalid')
  })
})

describe('toastKeyForRequestPasswordResetError', () => {
  it('maps 400 to the notSent key and does not use the English API string', () => {
    expect(toastKeyForRequestPasswordResetError(httpError(400, 'Unable to send reset link'))).toBe(
      'ForgotPassword.toast.notSent',
    )
  })

  it('maps unknown failures to the unexpected key', () => {
    expect(toastKeyForRequestPasswordResetError(httpError(500, 'Internal error'))).toBe(
      'ForgotPassword.toast.unexpected',
    )
  })

  it('does not emit a toast on 401', () => {
    expect(toastKeyForRequestPasswordResetError(httpError(401, 'Authentication failed'))).toBeNull()
  })
})

describe('useRequestPasswordReset', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls requestReset with the trimmed email and no actorId', async () => {
    const requestReset = vi.fn().mockResolvedValue(undefined)
    const { composable, dispose } = withReset({ requestReset })

    composable.requestReset('  joao@grau.pt  ')
    await flushPromises()

    expect(requestReset).toHaveBeenCalledTimes(1)
    expect(requestReset).toHaveBeenCalledWith({ email: 'joao@grau.pt' })
    expect(requestReset.mock.calls[0][0]).not.toHaveProperty('actorId')

    dispose()
  })

  it('on success pushes the sent toast', async () => {
    const { composable, dispose } = withReset({
      requestReset: vi.fn().mockResolvedValue(undefined),
    })

    composable.requestReset('joao@grau.pt')
    await flushPromises()

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Link de redefinição enviado. Verifique o seu e-mail.',
    })

    dispose()
  })

  it('on 400 pushes the notSent toast', async () => {
    const { composable, dispose } = withReset({
      requestReset: vi.fn().mockRejectedValue(httpError(400, 'Unable to send reset link')),
    })

    composable.requestReset('erro@grau.pt')
    await flushPromises()

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Não foi possível enviar o link. Verifique o e-mail e tente novamente.',
    })

    dispose()
  })

  it('on a blank email pushes the required toast and does not call the port', async () => {
    const requestReset = vi.fn().mockResolvedValue(undefined)
    const { composable, dispose } = withReset({ requestReset })

    composable.requestReset('   ')
    await flushPromises()

    expect(requestReset).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Indique o e-mail da sua conta.',
    })

    dispose()
  })

  it('on an invalid email pushes the invalid toast and does not call the port', async () => {
    const requestReset = vi.fn().mockResolvedValue(undefined)
    const { composable, dispose } = withReset({ requestReset })

    composable.requestReset('joao@grau')
    await flushPromises()

    expect(requestReset).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Indique um e-mail válido.',
    })

    dispose()
  })
})
