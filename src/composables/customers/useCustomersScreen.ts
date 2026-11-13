import { computed, ref } from 'vue'
import { canRemoveCustomer } from '../../domain/customer-actions'
import { httpCustomersApi } from '../../services/api/customers/http-customers-api'
import { httpIndicationsApi } from '../../services/api/indications/http-indications-api'
import type { GetLinkableIndicationOriginsApi } from '../../services/api/indications/types'
import type {
  CreateCustomerApi,
  GetCustomerApi,
  GetCustomersApi,
  RemoveCustomerApi,
  RemoveCustomerParams,
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

type CustomersScreenApi = GetCustomersApi & Partial<GetCustomerApi & RemoveCustomerApi>

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

  const canRemove = computed(
    () => canRemoveCustomer(authStore.actor) && typeof api.remove === 'function',
  )

  const removeSource: RemoveCustomerApi = {
    remove: (params: RemoveCustomerParams) => {
      if (api.remove) return api.remove(params)
      return Promise.reject(new Error('Remove customer is not available'))
    },
  }

  const isCreateDrawerOpen = ref(false)
  const isRemoveModalOpen = ref(false)
  const activeCustomerId = ref<string | null>(null)
  const customerWasReferred = ref(false)
  const customerIndicationCategoryId = ref<IndicationCategoryId | null>(null)
  const indicationOptions = useCustomerIndicationOptions(
    linkableOrigins,
    customerIndicationCategoryId,
  )

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
      if (detail.customerId.value === result.id) detail.close()
    },
    onAlreadyRemoved: (id) => {
      resetRemoveModal()
      if (detail.customerId.value === id) detail.close()
    },
    onForbidden: () => {
      resetRemoveModal()
    },
  })

  const removeCustomerName = computed(() => {
    if (!activeCustomerId.value) return ''
    if (detail.customer.value?.id === activeCustomerId.value) {
      return detail.customer.value.name
    }
    return (
      filteredCustomers.value.find((customer) => customer.id === activeCustomerId.value)
        ?.name ?? ''
    )
  })

  const openCreateDrawer = () => {
    detail.close()
    resetIndicationChoice()
    isCreateDrawerOpen.value = true
  }

  const openCustomer = (id: string) => {
    isCreateDrawerOpen.value = false
    detail.open(id)
  }

  const closeCustomer = () => {
    detail.close()
  }

  const onCustomerRowClick = (event: MouseEvent, id: string) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-row-action]')) return
    openCustomer(id)
  }

  const closeCreateDrawer = () => {
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
    onRemove: openRemoveModal,
  })

  const handleCreateCustomer = (payload: Customer.CreateCommand) => {
    createCustomer(payload)
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
    canRemove,
    detailCustomerId: detail.customerId,
    detailCustomer: detail.customer,
    isDetailLoading: detail.isLoading,
    openCustomer,
    closeCustomer,
    onCustomerRowClick,
    isCreateDrawerOpen,
    isRemoveModalOpen,
    activeCustomerId,
    removeCustomerName,
    ...selection,
    isCreating,
    isRemoving,
    removeError,
    indicationOrigins: indicationOptions.origins,
    isLoadingIndicationOrigins: indicationOptions.isLoading,
    indicationOriginsErrorKey: indicationOptions.errorKey,
    setCustomerWasReferred,
    setCustomerIndicationCategory,
    openCreateDrawer,
    closeCreateDrawer,
    openRemoveModal,
    closeRemoveModal,
    handleCreateCustomer,
    handleRemoveCustomer,
  }
}
