import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import type { CreateEmployeeApi, CreateEmployeeResult } from '../services/api/employees/types'
import type { EmployeeCreatePayload } from '../types/employee'
import {
  toastMessageForCreateError,
  toCreateEmployeeParams,
  useCreateEmployee,
} from './useCreateEmployee'
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

function payload(overrides: Partial<EmployeeCreatePayload> = {}): EmployeeCreatePayload {
  return {
    name: 'João Silva',
    username: 'joaosilva',
    email: 'joao@grau.pt',
    phone: '+351912345678',
    nif: '123456789',
    permission: 'EMPLOYEE',
    status: 'ACTIVE',
    gender: 'Masculino',
    address: 'Rua das Flores, 123',
    languages: 'Português',
    emergencyContact: '+351911000000',
    employmentId: 'EMP-001',
    jobTitle: 'Barbeiro',
    password: 'senhaSegura123',
   passwordConfirmation: 'senhaSegura123',
    ...overrides,
  }
}

function created(): CreateEmployeeResult {
  return {
    id: 'emp-new',
    name: 'João Silva',
    email: 'joao@grau.pt',
    role: 'EMPLOYEE',
    phone: '+351912345678',
    nif: '123456789',
    status: 'ACTIVE',
    createdAt: '2026-08-29T00:00:00.000Z',
  }
}

function withCreate(
  api: CreateEmployeeApi,
  options: Parameters<typeof useCreateEmployee>[1],
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
    scope.run(() => useCreateEmployee(api, options)),
  )
  if (!composable) {
    throw new Error('useCreateEmployee did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('toCreateEmployeeParams', () => {
  it('renames permission to role and keeps passwordConfirmation', () => {
    const params = toCreateEmployeeParams(payload())

    expect(params.role).toBe('EMPLOYEE')
    expect(params.password).toBe('senhaSegura123')
    expect(params.passwordConfirmation).toBe('senhaSegura123')
    expect(params).not.toHaveProperty('permission')
    expect(params).not.toHaveProperty('confirmPassword')
  })

  it('drops empty optional fields', () => {
    const params = toCreateEmployeeParams(
      payload({
        phone: '',
        nif: '',
        username: '',
        address: '',
        emergencyContact: '',
        employmentId: '',
        jobTitle: '',
      }),
    )

    expect(params.phone).toBeUndefined()
    expect(params.nif).toBeUndefined()
    expect(params.username).toBeUndefined()
    expect(params.address).toBeUndefined()
    expect(params.emergencyContact).toBeUndefined()
    expect(params.employmentId).toBeUndefined()
    expect(params.jobTitle).toBeUndefined()
  })
})

describe('toastMessageForCreateError', () => {
  it('maps 409 to e-mail em uso and does not use the English API string', () => {
    expect(toastMessageForCreateError(httpError(409, 'Email already in use'))).toBe(
      'Este e-mail já está em uso.',
    )
  })

  it('maps 400 to the validation copy', () => {
    expect(toastMessageForCreateError(httpError(400, 'Invalid payload'))).toBe(
      'Não foi possível criar o colaborador. Verifique os dados.',
    )
  })

  it('maps 403 to Ação não permitida', () => {
    expect(toastMessageForCreateError(httpError(403, 'Action not allowed'))).toBe(
      'Ação não permitida.',
    )
  })

  it('does not emit a create toast on 401', () => {
    expect(toastMessageForCreateError(httpError(401, 'Authentication failed'))).toBeNull()
  })
})

describe('useCreateEmployee', () => {
  afterEach(() => {
    dismissAllToasts()
  })

  it('calls create with API params and no actorId', async () => {
    const create = vi.fn().mockResolvedValue(created())
    const { composable, dispose } = withCreate({ create }, { onCreated: vi.fn() })

    composable.create(payload())
    await flushPromises()

    expect(create).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledWith(toCreateEmployeeParams(payload()))
    expect(create.mock.calls[0][0]).not.toHaveProperty('actorId')
    expect(create.mock.calls[0][0]).not.toHaveProperty('permission')
    expect(create.mock.calls[0][0]).toHaveProperty(
      'passwordConfirmation',
      'senhaSegura123',
    )

    dispose()
  })

  it('on 200 calls onCreated and pushes the success toast', async () => {
    const onCreated = vi.fn()
    const result = created()
    const { composable, dispose } = withCreate(
      { create: vi.fn().mockResolvedValue(result) },
      { onCreated },
    )

    composable.create(payload())
    await flushPromises()

    expect(onCreated).toHaveBeenCalledWith(result)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Colaborador criado.',
    })

    dispose()
  })

  it('on 409 pushes e-mail em uso and does not call onCreated', async () => {
    const onCreated = vi.fn()
    const { composable, dispose } = withCreate(
      { create: vi.fn().mockRejectedValue(httpError(409, 'Email already in use')) },
      { onCreated },
    )

    composable.create(payload())
    await flushPromises()

    expect(onCreated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Este e-mail já está em uso.',
    })

    dispose()
  })

  it('on 403 pushes Ação não permitida and does not call onCreated', async () => {
    const onCreated = vi.fn()
    const { composable, dispose } = withCreate(
      { create: vi.fn().mockRejectedValue(httpError(403, 'Action not allowed')) },
      { onCreated },
    )

    composable.create(payload())
    await flushPromises()

    expect(onCreated).not.toHaveBeenCalled()
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'error',
      message: 'Ação não permitida.',
    })

    dispose()
  })
})
