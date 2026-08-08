import { onMounted, onUnmounted, ref } from 'vue'

type UseEmployeeSelectionOptions = {
  onEdit?: (employeeId: string) => void
  onRemove?: (employeeId: string) => void
}

export function useEmployeeSelection(options: UseEmployeeSelectionOptions = {}) {
  const selectedIds = ref<string[]>([])
  const openActionsId = ref<string | null>(null)

  const isSelected = (id: string) => selectedIds.value.includes(id)

  const toggleSelect = (id: string) => {
    if (isSelected(id)) {
      selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id)
      return
    }
    selectedIds.value = [...selectedIds.value, id]
  }

  const closeActionsMenu = () => {
    openActionsId.value = null
  }

  const toggleActionsMenu = (employeeId: string) => {
    openActionsId.value =
      openActionsId.value === employeeId ? null : employeeId
  }

  const onEditAction = (employeeId: string) => {
    closeActionsMenu()
    options.onEdit?.(employeeId)
  }

  const onRemoveAction = (employeeId: string) => {
    closeActionsMenu()
    options.onRemove?.(employeeId)
  }

  const onDocumentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    if (!target?.closest('[data-actions-menu]')) {
      closeActionsMenu()
    }
  }

  onMounted(() => {
    document.addEventListener('click', onDocumentClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
  })

  return {
    selectedIds,
    openActionsId,
    isSelected,
    toggleSelect,
    closeActionsMenu,
    toggleActionsMenu,
    onEditAction,
    onRemoveAction,
  }
}
