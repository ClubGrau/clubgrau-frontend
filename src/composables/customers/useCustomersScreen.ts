import { computed, ref } from 'vue'
import { hardcodedCustomersApi } from '../../services/api/customers/hardcoded-customers-api'
import type {
  CreateCustomerApi,
  GetCustomersApi,
  RemoveCustomerApi,
} from '../../services/api/customers/types'
import type { Customer } from '../../types/customer'
import { useCreateCustomer } from './useCreateCustomer'
import { useCustomerSelection } from './useCustomerSelection'
import { useCustomers } from './useCustomers'
import { useRemoveCustomer } from './useRemoveCustomer'

export function useCustomersScreen(
  api: GetCustomersApi & CreateCustomerApi & RemoveCustomerApi = hardcodedCustomersApi,
) {
  const {
    filteredCustomers,
    pageSize,
    currentPage,
    searchQuery,
    rankFilter,
    toggleRankFilter,
    total,
  } = useCustomers(api)

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
    onRemoved: () => {
      isRemoveModalOpen.value = false
      activeCustomerId.value = null
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
    isCreateDrawerOpen.value = true
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
    total,
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
