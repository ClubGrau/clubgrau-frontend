import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { ResetPasswordApi } from '../../services/api/auth/types'
import { useToast } from '../useToast'
import {
  toastKeyForPasswordIssue,
  toastKeyForResetPasswordError,
  useResetPassword,
} from './useResetPassword'

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

function withReset(api: ResetPasswordApi) {
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
    scope.run(() => useResetPassword(api)),
  )
  if (!composable) {
    throw new Error('useResetPassword did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toastKeyForPasswordIssue', () => {
  it('maps password issues to ResetPassword toast keys', () => {
    expect(toastKeyForPasswordIssue('empty')).toBe('ResetPassword.toast.passwordRequired')
    expect(toastKeyForPasswordIssue('tooShort')).toBe('ResetPassword.toast.passwordTooShort')
    expect(toastKeyForPasswordIssue('mismatch')).toBe('ResetPassword.toast.passwordMismatch')
  })
})

describe('toastKeyForResetPasswordError', () => {
  it('maps invalid reset tokens to the invalid key', () => {
    expect(toastKeyForResetPasswordError(httpError(400, 'Invalid reset token'))).toBe(
      'ResetPassword.toast.invalid',
    )
  })

  it('maps expired reset tokens to the expired key', () => {
    expect(toastKeyForResetPasswordError(httpError(400, 'Reset token expired'))).toBe(
      'ResetPassword.toast.expired',
    )
  })

  it('maps unknown failures to the unexpected key', () => {
    expect(toastKeyForResetPasswordError(httpError(500, 'Internal error'))).toBe(
      'ResetPassword.toast.unexpected',
    )
  })

  it('does not emit a toast on 401', () => {
    expect(toastKeyForResetPasswordError(httpError(401, 'Authentication failed'))).toBeNull()
  })
})

describe('useResetPassword', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls resetPassword with token and trimmed passwords and no actorId', async () => {
    const resetPassword = vi.fn().mockResolvedValue(undefined)
    const { composable, dispose } = withReset({ resetPassword })

    composable.resetPassword({
      token: ' reset-token ',
      password: '  SenhaSegura1!  ',
      passwordConfirmation: '  SenhaSegura1!  ',
    })
    await flushPromises()

    expect(resetPassword).toHaveBeenCalledTimes(1)
    expect(resetPassword).toHaveBeenCalledWith({
      token: ' reset-token ',
      password: '  SenhaSegura1!  ',
      passwordConfirmation: '  SenhaSegura1!  ',
    })
    expect(resetPassword.mock.calls[0][0]).not.toHaveProperty('actorId')

    dispose()
  })

  it('on success pushes the saved toast', async () => {
    const { composable, dispose } = withReset({
      resetPassword: vi.fn().mockResolvedValue(undefined),
    })

    composable.resetPassword({
      token: 'valid-token',
      password: 'SenhaSegura1!',
      passwordConfirmation: 'SenhaSegura1!',
    })
    await flushPromises()

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Nova palavra-passe guardada. Já pode iniciar sessão.',
    })

    dispose()
  })

  it('on 400 pushes the invalid toast', async () => {
    const { composable, dispose } = withReset({
      resetPassword: vi.fn().mockRejectedValue(httpError(400, 'Invalid reset token')),
    })

    composable.resetPassword({
      token: 'invalid',
      password: 'SenhaSegura1!',
      passwordConfirmation: 'SenhaSegura1!',
    })
    await flushPromises()

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Este link de redefinição não é válido. Peça um novo link.',
    })

    dispose()
  })

  it('does not call the port when token is blank', async () => {
    const resetPassword = vi.fn().mockResolvedValue(undefined)
    const { composable, dispose } = withReset({ resetPassword })

    composable.resetPassword({
      token: '   ',
      password: 'SenhaSegura1!',
      passwordConfirmation: 'SenhaSegura1!',
    })
    await flushPromises()

    expect(resetPassword).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(0)

    dispose()
  })
})
