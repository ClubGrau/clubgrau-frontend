import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { useCustomerSelection } from './useCustomerSelection'

function withSelection(options: Parameters<typeof useCustomerSelection>[0] = {}) {
  const app = createApp({})
  const scope = effectScope()
  const composable = app.runWithContext(() =>
    scope.run(() => useCustomerSelection(options)),
  )
  if (!composable) {
    throw new Error('useCustomerSelection did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useCustomerSelection', () => {
  it('closes the overflow menu after an action', () => {
    const onRemove = vi.fn()
    const { composable, dispose } = withSelection({ onRemove })

    composable.openActionsId.value = 'cust-1'
    composable.onRemoveAction('cust-1')

    expect(onRemove).toHaveBeenCalledWith('cust-1')
    expect(composable.openActionsId.value).toBeNull()

    dispose()
  })
})
