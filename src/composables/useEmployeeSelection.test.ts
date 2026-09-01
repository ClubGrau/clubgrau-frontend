import { describe, expect, it, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { useEmployeeSelection } from './useEmployeeSelection'

function withSelection(options: Parameters<typeof useEmployeeSelection>[0] = {}) {
  const app = createApp({})
  const scope = effectScope()
  const composable = app.runWithContext(() =>
    scope.run(() => useEmployeeSelection(options)),
  )
  if (!composable) {
    throw new Error('useEmployeeSelection did not return inside the Vue context')
  }
  return {
    composable,
    dispose: () => {
      scope.stop()
      app.unmount()
    },
  }
}

describe('useEmployeeSelection', () => {
  it('does not expose row selection', () => {
    const { composable, dispose } = withSelection()

    expect(composable).not.toHaveProperty('selectedIds')
    expect(composable).not.toHaveProperty('toggleSelect')
    expect(composable).not.toHaveProperty('isSelected')

    dispose()
  })

  it('closes the overflow menu after an action', () => {
    const onEdit = vi.fn()
    const { composable, dispose } = withSelection({ onEdit })

    composable.openActionsId.value = 'emp-1'
    composable.onEditAction('emp-1')

    expect(onEdit).toHaveBeenCalledWith('emp-1')
    expect(composable.openActionsId.value).toBeNull()

    dispose()
  })
})
