import { onMounted, onUnmounted, ref, type CSSProperties } from 'vue'

type UseCustomerSelectionOptions = {
  onRemove?: (customerId: string) => void
}

const ACTIONS_MENU_HEIGHT = 48
const ACTIONS_MENU_GAP = 4

export function useCustomerSelection(options: UseCustomerSelectionOptions = {}) {
  const openActionsId = ref<string | null>(null)
  const actionsMenuStyle = ref<CSSProperties>({})

  const closeActionsMenu = () => {
    openActionsId.value = null
  }

  const positionActionsMenu = (trigger: HTMLElement) => {
    const rect = trigger.getBoundingClientRect()
    const openUpward =
      rect.bottom + ACTIONS_MENU_HEIGHT + ACTIONS_MENU_GAP > window.innerHeight &&
      rect.top > ACTIONS_MENU_HEIGHT + ACTIONS_MENU_GAP

    actionsMenuStyle.value = {
      right: `${Math.max(window.innerWidth - rect.right, 8)}px`,
      top: openUpward
        ? `${rect.top - ACTIONS_MENU_HEIGHT - ACTIONS_MENU_GAP}px`
        : `${rect.bottom + ACTIONS_MENU_GAP}px`,
    }
  }

  const toggleActionsMenu = (customerId: string, trigger?: EventTarget | null) => {
    if (openActionsId.value === customerId) {
      closeActionsMenu()
      return
    }

    openActionsId.value = customerId
    if (trigger instanceof HTMLElement) {
      positionActionsMenu(trigger)
    }
  }

  const onRemoveAction = (customerId: string) => {
    closeActionsMenu()
    options.onRemove?.(customerId)
  }

  const onDocumentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    if (!target?.closest('[data-actions-menu]')) {
      closeActionsMenu()
    }
  }

  const onViewportChange = () => {
    if (openActionsId.value) closeActionsMenu()
  }

  onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
  })

  onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange, true)
  })

  return {
    openActionsId,
    actionsMenuStyle,
    closeActionsMenu,
    toggleActionsMenu,
    onRemoveAction,
  }
}
