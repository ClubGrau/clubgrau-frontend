import { computed, ref } from 'vue'
import { canRemoveCustomer, canUpdateCustomer } from '../../domain/customer-actions'
import { httpCustomersApi } from '../../services/api/customers/http-customers-api'
import { httpIndicationsApi } from '../../services/api/indications/http-indications-api'
import type { GetLinkableIndicationOriginsApi } from '../../services/api/indications/types'
import type {
  CreateCustomerApi,
  GetCustomerApi,
  GetCustomersApi,
  RemoveCustomerApi,
  RemoveCustomerParams,
  UpdateCustomerApi,
  UpdateCustomerParams,
} from '../../services/api/customers/types'
import { useAuthStore } from '../../stores/auth'
import type { IndicationCategoryId } from '../../types/indication'
import type { Customer } from '../../types/customer'
import { useCreateCustomer } from './useCreateCustomer'
import { useCustomerDetail } from './useCustomerDetail'
import { useCustomerIndicationOptions } from './useCustomerIndicationOptions'
import { useCustomerSelection } from './useCustomerSelection'
import { useCustomers } from './useCustomers'
import { useRemoveCustomer } from './useRemoveCustomer'
import { useUpdateCustomer } from './useUpdateCustomer'

type CustomersScreenApi = GetCustomersApi &
  Partial<GetCustomerApi & UpdateCustomerApi & RemoveCustomerApi>

export function useCustomersScreen(
  api: CustomersScreenApi = httpCustomersApi,
  createCustomerApi: CreateCustomerApi = httpCustomersApi,
  linkableOrigins: GetLinkableIndicationOriginsApi = httpIndicationsApi,
) {
  const authStore = useAuthStore()

  const {
    filteredCustomers,
    pageSize,
    currentPage,
    searchQuery,
    rankFilter,
    toggleRankFilter,
    sortKey,
    sortDirection,
    toggleSort,
    summary,
    hasSummary,
    isStatsLoading,
    joinedThisMonth,
    walletTotal,
    hasJoinedThisMonth,
    total,
    isLoading,
    isFetching,
    isError,
  } = useCustomers(api)

  const detailSource: GetCustomerApi = {
    getCustomer: (id) => {
      if (api.getCustomer) return api.getCustomer(id)
      const listed = filteredCustomers.value.find((customer) => customer.id === id) ?? null
      return Promise.resolve(listed)
    },
  }

  const detail = useCustomerDetail(detailSource)

  const detailCustomer = computed<Customer.ListItem | null>(() => {
    if (!detail.customerId.value) return null
    if (!api.getCustomer) {
      return (
        filteredCustomers.value.find((customer) => customer.id === detail.customerId.value) ??
        detail.customer.value
      )
    }
    return detail.customer.value
  })

  const canUpdate = computed(
    () => canUpdateCustomer(authStore.actor) && typeof api.update === 'function',
  )

  const canRemove = computed(
    () => canRemoveCustomer(authStore.actor) && typeof api.remove === 'function',
  )

  const hasRowActions = computed(() => canUpdate.value || canRemove.value)

  const updateSource: UpdateCustomerApi = {
    update: (params: UpdateCustomerParams) => {
      if (api.update) return api.update(params)
      return Promise.reject(new Error('Update customer is not available'))
    },
  }

  const removeSource: RemoveCustomerApi = {
    remove: (params: RemoveCustomerParams) => {
      if (api.remove) return api.remove(params)
      return Promise.reject(new Error('Remove customer is not available'))
    },
  }

  const isCreateDrawerOpen = ref(false)
  const editingCustomerId = ref<string | null>(null)
  const editingCustomerSnapshot = ref<Customer.ListItem | null>(null)
  const returnToDetailId = ref<string | null>(null)
  const isRemoveModalOpen = ref(false)
  const activeCustomerId = ref<string | null>(null)
  const customerWasReferred = ref(false)
  const customerIndicationCategoryId = ref<IndicationCategoryId | null>(null)
  const indicationOptions = useCustomerIndicationOptions(
    linkableOrigins,
    customerIndicationCategoryId,
  )

  const isEditDrawerOpen = computed(() => editingCustomerId.value !== null)

  const editCustomer = computed<Customer.ListItem | null>(() => {
    if (!editingCustomerId.value) return null
    return (
      filteredCustomers.value.find((customer) => customer.id === editingCustomerId.value) ??
      editingCustomerSnapshot.value
    )
  })

  const clearEditState = () => {
    editingCustomerId.value = null
    editingCustomerSnapshot.value = null
    returnToDetailId.value = null
  }

  const finishEditDrawer = () => {
    const detailId = returnToDetailId.value
    clearEditState()
    if (detailId) detail.open(detailId)
  }

  const resetIndicationChoice = () => {
    customerWasReferred.value = false
    customerIndicationCategoryId.value = null
  }

  const setCustomerWasReferred = (value: boolean) => {
    customerWasReferred.value = value
    if (!value) customerIndicationCategoryId.value = null
  }

  const setCustomerIndicationCategory = (categoryId: IndicationCategoryId | null) => {
    customerIndicationCategoryId.value = categoryId
  }

  const { create: createCustomer, isCreating } = useCreateCustomer(createCustomerApi, {
    onCreated: () => {
      currentPage.value = 1
      isCreateDrawerOpen.value = false
    },
  })

  const { update: updateCustomer, isUpdating } = useUpdateCustomer(updateSource, {
    onUpdated: () => {
      finishEditDrawer()
    },
    onNoChanges: () => {
      finishEditDrawer()
    },
    onAlreadyRemoved: (id) => {
      clearEditState()
      if (detail.customerId.value === id) detail.close()
    },
    onForbidden: () => {
      clearEditState()
    },
  })

  const resetRemoveModal = () => {
    isRemoveModalOpen.value = false
    activeCustomerId.value = null
    removeError.value = null
  }

  const { remove, isRemoving, removeError } = useRemoveCustomer(removeSource, {
    onRemoved: (result) => {
      if (filteredCustomers.value.length <= 1 && currentPage.value > 1) {
        currentPage.value -= 1
      }
      resetRemoveModal()
      clearEditState()
      if (detail.customerId.value === result.id) detail.close()
    },
    onAlreadyRemoved: (id) => {
      resetRemoveModal()
      clearEditState()
      if (detail.customerId.value === id) detail.close()
    },
    onForbidden: () => {
      resetRemoveModal()
    },
  })

  const removeCustomerName = computed(() => {
    if (!activeCustomerId.value) return ''
    if (detailCustomer.value?.id === activeCustomerId.value) {
      return detailCustomer.value.name
    }
    return (
      filteredCustomers.value.find((customer) => customer.id === activeCustomerId.value)
        ?.name ?? ''
    )
  })

  const openCreateDrawer = () => {
    clearEditState()
    detail.close()
    resetIndicationChoice()
    isCreateDrawerOpen.value = true
  }

  const openCustomer = (id: string) => {
    clearEditState()
    isCreateDrawerOpen.value = false
    detail.open(id)
  }

  const closeCustomer = () => {
    detail.close()
  }

  const openEditDrawer = (id: string) => {
    if (!canUpdate.value) return
    const target =
      (detailCustomer.value?.id === id ? detailCustomer.value : null) ??
      filteredCustomers.value.find((customer) => customer.id === id) ??
      null
    if (!target) return

    returnToDetailId.value = detail.customerId.value === id ? id : null
    isCreateDrawerOpen.value = false
    detail.close()
    editingCustomerSnapshot.value = { ...target }
    editingCustomerId.value = id
  }

  const closeEditDrawer = () => {
    if (isUpdating.value) return
    finishEditDrawer()
  }

  const onCustomerRowClick = (event: MouseEvent, id: string) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-row-action]')) return
    openCustomer(id)
  }

  const closeCreateDrawer = () => {
    if (isCreating.value) return
    isCreateDrawerOpen.value = false
    resetIndicationChoice()
  }

  const openRemoveModal = (id: string) => {
    if (!canRemove.value) return
    removeError.value = null
    activeCustomerId.value = id
    isRemoveModalOpen.value = true
  }

  const closeRemoveModal = () => {
    if (isRemoving.value) return
    resetRemoveModal()
  }

  const selection = useCustomerSelection({
    onEdit: openEditDrawer,
    onRemove: openRemoveModal,
    getMenuHeight: () => (canUpdate.value && canRemove.value ? 88 : 48),
  })

  const handleCreateCustomer = (payload: Customer.CreateCommand) => {
    createCustomer(payload)
  }

  const handleUpdateCustomer = (payload: Customer.UpdateCommand) => {
    const original = editingCustomerSnapshot.value ?? editCustomer.value
    if (!canUpdate.value || !original) return
    updateCustomer({ command: payload, original })
  }

  const handleRemoveCustomer = (password: string) => {
    if (!canRemove.value || !activeCustomerId.value) return
    remove({ id: activeCustomerId.value, password })
  }

  return {
    filteredCustomers,
    pageSize,
    currentPage,
    searchQuery,
    rankFilter,
    toggleRankFilter,
    sortKey,
    sortDirection,
    toggleSort,
    summary,
    hasSummary,
    isStatsLoading,
    joinedThisMonth,
    walletTotal,
    hasJoinedThisMonth,
    total,
    isListLoading: isLoading,
    isListFetching: isFetching,
    isListError: isError,
    canUpdate,
    canRemove,
    hasRowActions,
    detailCustomerId: detail.customerId,
    detailCustomer,
    isDetailLoading: detail.isLoading,
    openCustomer,
    closeCustomer,
    onCustomerRowClick,
    isCreateDrawerOpen,
    isEditDrawerOpen,
    editCustomer,
    isRemoveModalOpen,
    activeCustomerId,
    removeCustomerName,
    ...selection,
    isCreating,
    isUpdating,
    isRemoving,
    removeError,
    indicationOrigins: indicationOptions.origins,
    isLoadingIndicationOrigins: indicationOptions.isLoading,
    indicationOriginsErrorKey: indicationOptions.errorKey,
    setCustomerWasReferred,
    setCustomerIndicationCategory,
    openCreateDrawer,
    closeCreateDrawer,
    openEditDrawer,
    closeEditDrawer,
    openRemoveModal,
    closeRemoveModal,
    handleCreateCustomer,
    handleUpdateCustomer,
    handleRemoveCustomer,
  }
}
