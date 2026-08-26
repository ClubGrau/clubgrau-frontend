import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToast } from './useToast'

const { toasts, push, dismiss } = useToast()

function dismissAll() {
  for (const toast of [...toasts.value]) {
    dismiss(toast.id)
  }
}

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    dismissAll()
  })

  afterEach(() => {
    dismissAll()
    vi.useRealTimers()
  })

  it('pushes a toast onto the shared queue', () => {
    push('success', 'Colaborador inativado. Você pode reativá-lo pelo perfil.')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      variant: 'success',
      message: 'Colaborador inativado. Você pode reativá-lo pelo perfil.',
    })
    expect(toasts.value[0]?.id).toEqual(expect.any(String))
  })

  it('stacks multiple toasts', () => {
    push('success', 'ok')
    push('error', 'É preciso existir outro Administrador ativo antes desta ação.')

    expect(toasts.value.map((toast) => toast.variant)).toEqual(['success', 'error'])
    expect(toasts.value.map((toast) => toast.message)).toEqual([
      'ok',
      'É preciso existir outro Administrador ativo antes desta ação.',
    ])
  })

  it('dismisses a toast and clears its timer', () => {
    push('error', 'Ação não permitida.')
    const id = toasts.value[0]?.id
    expect(id).toBeDefined()

    dismiss(id!)
    expect(toasts.value).toHaveLength(0)

    vi.advanceTimersByTime(5000)
    expect(toasts.value).toHaveLength(0)
  })

  it('auto-dismisses after 5 seconds', () => {
    push('success', 'ok')
    expect(toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(4999)
    expect(toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(toasts.value).toHaveLength(0)
  })
})
