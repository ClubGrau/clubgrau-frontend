import { computed, ref } from 'vue'
import { hardcodedCustomersApi } from '../../services/api/customers/hardcoded-customers-api'
import type {
  CreateCustomerApi,
  GetCustomerApi,
  GetCustomersApi,
  RemoveCustomerApi,
} from '../../services/api/customers/types'
import type { Customer } from '../../types/customer'
import { useCreateCustomer } from './useCreateCustomer'
import { useCustomerDetail } from './useCustomerDetail'
import { useCustomerSelection } from './useCustomerSelection'
import { useCustomers } from './useCustomers'
import { useRemoveCustomer } from './useRemoveCustomer'

export function useCustomersScreen(
  api: GetCustomersApi &
    GetCustomerApi &
    CreateCustomerApi &
    RemoveCustomerApi = hardcodedCustomersApi,
) {
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
    total,
  } = useCustomers(api)

  const detail = useCustomerDetail(api)

  const isCreateDrawerOpen = ref(false)
  const isRemoveModalOpen = ref(false)
  const activeCustomerId = ref<string | null>(null)

  const { create: createCustomer, isCreating } = useCreateCustomer(api, {
    onCreated: () => {
      currentPage.value = 1
      isCreateDrawerOpen.value = false
    },
  })

  const { remove, isRemoving } = useRemoveCustomer(api, {
    onRemoved: (result) => {
      isRemoveModalOpen.value = false
      activeCustomerId.value = null
      if (detail.customerId.value === result.id) detail.close()
    },
  })

  const removeCustomerName = computed(() => {
    if (!activeCustomerId.value) return ''
    return (
      filteredCustomers.value.find((customer) => customer.id === activeCustomerId.value)
        ?.name ?? ''
    )
  })

  const openCreateDrawer = () => {
    detail.close()
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
  }

  const openRemoveModal = (id: string) => {
    activeCustomerId.value = id
    isRemoveModalOpen.value = true
  }

  const closeRemoveModal = () => {
    isRemoveModalOpen.value = false
    activeCustomerId.value = null
  }

  const selection = useCustomerSelection({
    onRemove: openRemoveModal,
  })

  const handleCreateCustomer = (payload: Customer.CreateCommand) => {
    createCustomer(payload)
  }

  const handleRemoveCustomer = () => {
    if (!activeCustomerId.value) return
    remove(activeCustomerId.value)
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
    total,
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
    openCreateDrawer,
    closeCreateDrawer,
    openRemoveModal,
    closeRemoveModal,
    handleCreateCustomer,
    handleRemoveCustomer,
  }
}
