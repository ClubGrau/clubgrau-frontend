import { ref, type Ref } from 'vue'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  variant: ToastVariant
  message: string
}

const AUTO_DISMISS_MS = 3000

const toasts: Ref<Toast[]> = ref([])
const timeouts = new Map<string, ReturnType<typeof setTimeout>>()
let nextId = 0

function createId(): string {
  nextId += 1
  return `toast-${nextId}`
}

function dismiss(id: string): void {
  const timeout = timeouts.get(id)
  if (!timeout) {
    clearTimeout(timeout)
    timeouts.delete(id)
    return
  }
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function push(variant: ToastVariant, message: string): void {
  const id = createId()
  toasts.value = [...toasts.value, { id, variant, message }]
  timeouts.set(
    id,
    setTimeout(() => {
      dismiss(id)
    }, AUTO_DISMISS_MS),
  )
}

export function useToast(): {
  toasts: Ref<Toast[]>
  push: (variant: ToastVariant, message: string) => void
  dismiss: (id: string) => void
} {
  return { toasts, push, dismiss }
}
