<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import Drawer from '../../components/Drawer/Drawer.vue';
import PageHeader from '../../components/PageHeader/PageHeader.vue';
import Pagination from '../../components/Pagination/Pagination.vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import ModalLayout from '../../components/Modal/ModalLayout.vue';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import { CUSTOMER_RANKS } from '../../constants/customer-rank';
import { useCustomersScreen } from '../../composables/customers/useCustomersScreen';
import CustomerFormPanel from './CustomerFormPanel.vue';
import RankPatch from './RankPatch.vue';
import RemoveCustomerModal from './RemoveCustomerModal.vue';

const { t } = useI18n();

const {
  filteredCustomers,
  pageSize,
  currentPage,
  searchQuery,
  rankFilter,
  toggleRankFilter,
  total,
  isCreateDrawerOpen,
  isRemoveModalOpen,
  removeCustomerName,
  isCreating,
  isRemoving,
  openCreateDrawer,
  closeCreateDrawer,
  closeRemoveModal,
  handleCreateCustomer,
  handleRemoveCustomer,
  openActionsId,
  actionsMenuStyle,
  toggleActionsMenu,
  onRemoveAction,
} = useCustomersScreen();

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { id: 'dashboard', label: t('Customers.breadcrumb.dashboard'), to: '/app/dashboard' },
  { id: 'customers', label: t('Customers.breadcrumb.customers') },
]);

const registrationDate = (iso: string) => iso.slice(0, 10);

const optionalDisplay = (value: string) => value.trim() || t('Customers.emptyValue');
</script>

<template>
  <div class="min-h-full bg-[#f5f5f7] px-8 pb-8 pt-5">
    <Breadcrumb :items="breadcrumbItems" />

    <PageHeader
      :title="t('Customers.title')"
      :subtitle="t('Customers.subtitle')"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f]"
          @click="openCreateDrawer"
        >
          {{ t('Customers.newCustomer') }}
          <span class="text-lg leading-none">+</span>
        </button>
      </template>
    </PageHeader>

    <section class="rounded-2xl bg-white p-5 shadow-sm">
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <div class="relative min-w-70 w-full max-w-2/3">
          <Icon
            icon="carbon:search"
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('Customers.searchPlaceholder')"
            class="w-full rounded-full border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-300"
          />
        </div>

        <div class="flex items-center gap-2" role="group" :aria-label="t('Customers.rankFilter.label')">
          <RankPatch
            v-for="rank in CUSTOMER_RANKS"
            :key="rank"
            :rank="rank"
            variant="filter"
            interactive
            :selected="rankFilter === rank"
            :aria-label="
              rankFilter === rank
                ? t('Customers.rankFilter.clear', { rank: t(`Customers.rank.${rank}`) })
                : t('Customers.rankFilter.apply', { rank: t(`Customers.rank.${rank}`) })
            "
            @click="toggleRankFilter(rank)"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-225 border-collapse text-left">
          <thead>
            <tr class="border-b border-gray-100 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
              <th class="py-3 pr-4 font-semibold">{{ t('Customers.table.customer') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Customers.table.contact') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Customers.table.nif') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Customers.table.referral') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Customers.table.rank') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Customers.table.registeredAt') }}</th>
              <th class="py-3 pl-2 text-right font-semibold">{{ t('Customers.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80"
            >
              <td class="py-4 pr-4 align-middle">
                <div class="flex items-center gap-3">
                  <UserAvatar
                    :initials="customer.initials"
                    size="sm"
                    :alt="customer.name"
                  />
                  <p class="truncate text-sm font-semibold text-gray-900">
                    {{ customer.name }}
                  </p>
                </div>
              </td>

              <td class="py-4 pr-4 align-middle">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <Icon icon="carbon:email" class="size-3.5 shrink-0 text-gray-400" />
                    <span class="truncate font-semibold">{{ customer.email }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <Icon icon="carbon:phone" class="size-3.5 shrink-0 text-gray-400" />
                    <span>{{ customer.phone }}</span>
                  </div>
                </div>
              </td>

              <td class="py-4 pr-4 align-middle text-sm text-gray-700">
                {{ optionalDisplay(customer.nif) }}
              </td>

              <td class="py-4 pr-4 align-middle text-sm text-gray-700">
                {{ optionalDisplay(customer.referral) }}
              </td>

              <td class="py-4 pr-4 align-middle">
                <RankPatch v-if="customer.rank" variant="table" :rank="customer.rank" />
                <span v-else class="text-sm text-gray-400">{{ t('Customers.emptyValue') }}</span>
              </td>

              <td class="py-4 pr-4 align-middle text-sm text-gray-700">
                {{ registrationDate(customer.createdAt) }}
              </td>

              <td
                class="py-4 pl-2 text-right align-middle"
                data-row-action
                data-actions-menu
              >
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  :aria-expanded="openActionsId === customer.id"
                  :aria-label="t('Customers.table.actions')"
                  aria-haspopup="menu"
                  @click.stop="toggleActionsMenu(customer.id, $event.currentTarget)"
                >
                  <Icon icon="carbon:overflow-menu-vertical" class="size-5" />
                </button>
              </td>
            </tr>

            <tr v-if="filteredCustomers.length === 0">
              <td colspan="7" class="py-12 text-center text-sm text-gray-400">
                {{ t('Customers.empty') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-items="total"
        page-size-placement="top"
      />
    </section>

    <Teleport to="body">
      <div
        v-if="openActionsId"
        data-actions-menu
        role="menu"
        class="fixed z-50 min-w-40 rounded-xl border border-gray-100 bg-white p-1.5 shadow-[0_12px_32px_rgba(16,22,37,0.12)]"
        :style="actionsMenuStyle"
      >
        <button
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
          @click.stop="onRemoveAction(openActionsId)"
        >
          <Icon icon="carbon:trash-can" class="size-4" />
          {{ t('Customers.menu.remove') }}
        </button>
      </div>
    </Teleport>

    <Drawer
      :open="isCreateDrawerOpen"
      width-class="w-full max-w-md"
      @close="closeCreateDrawer"
    >
      <CustomerFormPanel
        :submitting="isCreating"
        @close="closeCreateDrawer"
        @create="handleCreateCustomer"
      />
    </Drawer>

    <ModalLayout
      :open="isRemoveModalOpen"
      width-class="w-full max-w-md"
      @close="closeRemoveModal"
    >
      <RemoveCustomerModal :customer-name="removeCustomerName" />
      <template #footer>
        <button
          type="button"
          class="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          @click="closeRemoveModal"
        >
          {{ t('Customers.actions.cancel') }}
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#d64545] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c13c3c] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isRemoving"
          :aria-busy="isRemoving"
          @click="handleRemoveCustomer"
        >
          <Icon
            v-if="isRemoving"
            icon="carbon:circle-dash"
            class="size-4 animate-spin"
          />
          {{ t('Customers.actions.remove') }}
        </button>
      </template>
    </ModalLayout>
  </div>
</template>
