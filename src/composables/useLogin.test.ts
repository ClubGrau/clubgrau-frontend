import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  const memory: Record<string, string> = {}
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => memory[key] ?? null,
      setItem: (key: string, value: string) => {
        memory[key] = value
      },
      removeItem: (key: string) => {
        delete memory[key]
      },
      clear: () => {
        for (const key of Object.keys(memory)) delete memory[key]
      },
    },
  })
})
import { createApp, effectScope } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { AuthApi } from '../services/api/auth/types'
import { useToast } from './useToast'
import {
  loginFieldIssues,
  toastKeyForLoginError,
  toastKeyForLoginFieldIssue,
  useLogin,
} from './useLogin'

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

function withLogin(api: AuthApi) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: 0 },
      queries: { retry: false },
    },
  })
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/app', component: { template: '<div />' } },
    ],
  })
  const app = createApp({})
  app.use(pinia)
  app.use(router)
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()
  const composable = app.runWithContext(() => scope.run(() => useLogin(api)))
  if (!composable) {
    throw new Error('useLogin did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('loginFieldIssues', () => {
  it('reports an empty email and an empty password', () => {
    expect(loginFieldIssues({ email: '   ', password: '   ' })).toEqual([
      { field: 'email', issue: 'empty' },
      { field: 'password', issue: 'empty' },
    ])
  })

  it('reports an invalid email and leaves a filled password alone', () => {
    expect(loginFieldIssues({ email: 'joao@grau', password: 'segredo' })).toEqual([
      { field: 'email', issue: 'invalid' },
    ])
  })

  it('reports nothing when the email is valid and the password is filled', () => {
    expect(loginFieldIssues({ email: 'joao@grau.pt', password: 'segredo' })).toEqual([])
  })
})

describe('toastKeyForLoginFieldIssue', () => {
  it('maps empty and invalid email, and an empty password', () => {
    expect(toastKeyForLoginFieldIssue({ field: 'email', issue: 'empty' })).toBe(
      'Login.toast.emailRequired',
    )
    expect(toastKeyForLoginFieldIssue({ field: 'email', issue: 'invalid' })).toBe(
      'Login.toast.emailInvalid',
    )
    expect(toastKeyForLoginFieldIssue({ field: 'password', issue: 'empty' })).toBe(
      'Login.toast.passwordRequired',
    )
  })
})

describe('toastKeyForLoginError', () => {
  it('maps 401 to the opaque credentials key and does not use the English API string', () => {
    expect(toastKeyForLoginError(httpError(401, 'Authentication failed'))).toBe(
      'Login.toast.credentials',
    )
  })

  it('maps a missing email or password reported by the API', () => {
    expect(toastKeyForLoginError(httpError(400, 'Missing param email'))).toBe(
      'Login.toast.emailRequired',
    )
    expect(toastKeyForLoginError(httpError(400, 'Missing param password'))).toBe(
      'Login.toast.passwordRequired',
    )
  })

  it('maps any other 400 to the opaque credentials key', () => {
    expect(toastKeyForLoginError(httpError(400, 'Password must be at least 8 characters long'))).toBe(
      'Login.toast.credentials',
    )
  })

  it('maps unknown failures to the unexpected key', () => {
    expect(toastKeyForLoginError(httpError(500, 'Internal error'))).toBe(
      'Login.toast.unexpected',
    )
    expect(toastKeyForLoginError(new Error('Network Error'))).toBe('Login.toast.unexpected')
  })
})

describe('useLogin', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('on a blank form pushes the required toasts and does not call the port', async () => {
    const login = vi.fn().mockResolvedValue({ token: 'token' })
    const { composable, dispose } = withLogin({ login })

    composable.handleSubmit()
    await flushPromises()

    expect(login).not.toHaveBeenCalled()
    expect(toasts.value.map((toast) => toast.message)).toEqual([
      'Indique o e-mail.',
      'Indique a palavra-passe.',
    ])

    dispose()
  })

  it('on an invalid email pushes the invalid toast and does not call the port', async () => {
    const login = vi.fn().mockResolvedValue({ token: 'token' })
    const { composable, dispose } = withLogin({ login })

    composable.userCredentials.email = 'joao@grau'
    composable.userCredentials.password = 'SenhaSegura1!'
    composable.handleSubmit()
    await flushPromises()

    expect(login).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Indique um e-mail válido.',
    })
    expect(toasts.value[0]?.message).not.toContain('SenhaSegura1!')

    dispose()
  })

  it('on a blank password pushes the required toast without describing the password', async () => {
    const login = vi.fn().mockResolvedValue({ token: 'token' })
    const { composable, dispose } = withLogin({ login })

    composable.userCredentials.email = 'joao@grau.pt'
    composable.userCredentials.password = '   '
    composable.handleSubmit()
    await flushPromises()

    expect(login).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Indique a palavra-passe.',
    })
    expect(toasts.value[0]?.message).not.toMatch(/incorreta|inválida|8 caracteres/i)

    dispose()
  })

  it('keeps isSubmitting true while the login request is in flight', async () => {
    let resolveLogin: (value: { token: string }) => void = () => {}
    const login = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve
        }),
    )
    const { composable, dispose } = withLogin({ login })

    composable.userCredentials.email = 'joao@grau.pt'
    composable.userCredentials.password = 'SenhaSegura1!'
    expect(composable.isSubmitting.value).toBe(false)

    composable.handleSubmit()
    await flushPromises()

    expect(composable.isSubmitting.value).toBe(true)

    resolveLogin({ token: 'token' })
    await flushPromises()

    expect(composable.isSubmitting.value).toBe(false)

    dispose()
  })

  it('calls login with the trimmed email and does not send actorId', async () => {
    const login = vi.fn().mockResolvedValue({ token: 'token' })
    const { composable, dispose } = withLogin({ login })

    composable.userCredentials.email = '  joao@grau.pt  '
    composable.userCredentials.password = 'SenhaSegura1!'
    composable.userCredentials.remember = true
    composable.handleSubmit()
    await flushPromises()

    expect(login).toHaveBeenCalledTimes(1)
    expect(login).toHaveBeenCalledWith({
      email: 'joao@grau.pt',
      password: 'SenhaSegura1!',
      remember: true,
    })
    expect(login.mock.calls[0][0]).not.toHaveProperty('actorId')
    expect(toasts.value).toHaveLength(0)

    dispose()
  })

  it('on 401 pushes the opaque credentials toast and does not reveal the password', async () => {
    const password = 'SenhaErrada1!'
    const { composable, dispose } = withLogin({
      login: vi.fn().mockRejectedValue(httpError(401, 'Authentication failed')),
    })

    composable.userCredentials.email = 'joao@grau.pt'
    composable.userCredentials.password = password
    composable.handleSubmit()
    await flushPromises()

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Não foi possível entrar. Verifique o e-mail e a palavra-passe.',
    })
    expect(toasts.value[0]?.message).not.toContain(password)
    expect(toasts.value[0]?.message).not.toContain('Authentication failed')
    expect(toasts.value[0]?.message).not.toMatch(/incorreta|inválida/i)

    dispose()
  })

  it('on a network failure pushes the unexpected toast', async () => {
    const { composable, dispose } = withLogin({
      login: vi.fn().mockRejectedValue(new Error('Network Error')),
    })

    composable.userCredentials.email = 'joao@grau.pt'
    composable.userCredentials.password = 'SenhaSegura1!'
    composable.handleSubmit()
    await flushPromises()

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Não foi possível concluir a ação. Tente novamente.',
    })
    expect(toasts.value[0]?.message).not.toContain('Network Error')
    expect(toasts.value[0]?.message).not.toContain('SenhaSegura1!')

    dispose()
  })
})
