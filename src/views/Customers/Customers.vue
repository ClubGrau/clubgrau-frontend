<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import Drawer from '../../components/Drawer/Drawer.vue';
import PageHeader from '../../components/PageHeader/PageHeader.vue';
import StatCard from '../../components/StatCard/StatCard.vue';
import Pagination from '../../components/Pagination/Pagination.vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import ModalLayout from '../../components/Modal/ModalLayout.vue';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import type { CustomerSortKey } from '../../types/customer';
import type { StatCardItem } from '../../types/stat-card';
import { CUSTOMER_RANK_LADDER } from '../../constants/customer-rank';
import { formatRegistrationDate, joinedSharePercent } from '../../domain/customer-wallet';
import { useToast } from '../../composables/useToast';
import { useCustomersScreen } from '../../composables/customers/useCustomersScreen';
import CustomerDetailPanel from './CustomerDetailPanel.vue';
import CustomerFormPanel from './CustomerFormPanel.vue';
import RankPatch from './RankPatch.vue';
import RemoveCustomerModal from './RemoveCustomerModal.vue';
import PageContainer from '../../Layout/PageContainer.vue';

const { t } = useI18n();
const toast = useToast();

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
  detailCustomerId,
  detailCustomer,
  isDetailLoading,
  openCustomer,
  closeCustomer,
  onCustomerRowClick,
  openRemoveModal,
} = useCustomersScreen();

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { id: 'dashboard', label: t('Customers.breadcrumb.dashboard'), to: '/app/dashboard' },
  { id: 'customers', label: t('Customers.breadcrumb.customers') },
]);

const optionalDisplay = (value: string) => value.trim() || t('Customers.emptyValue');

const customerCountLabel = (count: number) =>
  t(count === 1 ? 'Customers.summary.customer' : 'Customers.summary.customers');

const statCards = computed<StatCardItem[]>(() => [
  {
    id: 'total',
    label: t('Customers.stats.total.label'),
    value: summary.value.total,
    description: t('Customers.stats.total.description'),
    icon: 'carbon:user-multiple',
    tone: 'neutral',
  },
  {
    id: 'joinedThisMonth',
    label: t('Customers.stats.joinedThisMonth.label'),
    value: summary.value.joinedThisMonth,
    description: t('Customers.stats.joinedThisMonth.description', {
      percent: joinedSharePercent(summary.value.joinedThisMonth, summary.value.total),
    }),
    icon: 'carbon:user-follow',
    tone: 'success',
  },
]);

const ariaSort = (key: CustomerSortKey) => {
  if (sortKey.value !== key) return 'none';
  return sortDirection.value === 'asc' ? 'ascending' : 'descending';
};

const sortIcon = (key: CustomerSortKey) => {
  if (sortKey.value !== key) return 'carbon:caret-sort';
  return sortDirection.value === 'asc' ? 'carbon:caret-sort-up' : 'carbon:caret-sort-down';
};

const copyNif = async (nif: string) => {
  try {
    await navigator.clipboard.writeText(nif);
    toast.push('success', t('Customers.toast.nifCopied'));
  } catch {
    toast.push('error', t('Customers.toast.unexpected'));
  }
};
</script>

<template>
  <PageContainer class="min-h-full bg-[#f5f5f7] px-8 pb-8 pt-5">
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
          <Icon icon="carbon:add" class="size-4" />
          {{ t('Customers.newCustomer') }}
        </button>
      </template>
    </PageHeader>

    <div class="mb-6 grid w-full max-w-1/2 grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard
        v-for="card in statCards"
        :key="card.id"
        v-bind="card"
      />
    </div>

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
            v-for="rank in CUSTOMER_RANK_LADDER"
            :key="rank"
            :rank="rank"
            :count="summary.byRank[rank]"
            variant="filter"
            interactive
            :selected="rankFilter === rank"
            :aria-label="
              rankFilter === rank
                ? t('Customers.rankFilter.clear', { rank: t(`Customers.rank.${rank}`) })
                : t('Customers.rankFilter.apply', {
                    rank: t(`Customers.rank.${rank}`),
                    count: summary.byRank[rank],
                  })
            "
            @click="toggleRankFilter(rank)"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-225 border-collapse text-left">
          <thead>
            <tr class="border-b border-gray-100 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
              <th class="py-3 pr-4 font-semibold" :aria-sort="ariaSort('name')">
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center gap-1"
                  :aria-label="t('Customers.table.sort', { column: t('Customers.table.customer') })"
                  @click="toggleSort('name')"
                >
                  {{ t('Customers.table.customer') }}
                  <Icon :icon="sortIcon('name')" class="size-3.5" :class="sortKey === 'name' ? 'text-gray-700' : 'text-gray-300'" />
                </button>
              </th>
              <th class="py-3 pr-4 font-semibold">{{ t('Customers.table.contact') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Customers.table.nif') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Customers.table.referral') }}</th>
              <th class="py-3 pr-4 font-semibold" :aria-sort="ariaSort('rank')">
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center gap-1"
                  :aria-label="t('Customers.table.sort', { column: t('Customers.table.rank') })"
                  @click="toggleSort('rank')"
                >
                  {{ t('Customers.table.rank') }}
                  <Icon :icon="sortIcon('rank')" class="size-3.5" :class="sortKey === 'rank' ? 'text-gray-700' : 'text-gray-300'" />
                </button>
              </th>
              <th class="py-3 pr-4 font-semibold" :aria-sort="ariaSort('createdAt')">
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center gap-1"
                  :aria-label="t('Customers.table.sort', { column: t('Customers.table.registeredAt') })"
                  @click="toggleSort('createdAt')"
                >
                  {{ t('Customers.table.registeredAt') }}
                  <Icon :icon="sortIcon('createdAt')" class="size-3.5" :class="sortKey === 'createdAt' ? 'text-gray-700' : 'text-gray-300'" />
                </button>
              </th>
              <th class="py-3 pl-2 text-right font-semibold">{{ t('Customers.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="cursor-pointer border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80"
              @click="onCustomerRowClick($event, customer.id)"
            >
              <td class="py-4 pr-4 align-middle">
                <div class="flex items-center gap-3">
                  <UserAvatar
                    :initials="customer.initials"
                    size="sm"
                    :alt="customer.name"
                  />
                  <button
                    type="button"
                    class="truncate text-left text-sm font-semibold text-gray-900 hover:underline"
                    @click="openCustomer(customer.id)"
                  >
                    {{ customer.name }}
                  </button>
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

              <td class="py-4 pr-4 align-middle text-sm text-gray-500">
                <div v-if="customer.nif.trim()" class="flex items-center gap-1.5">
                  <span>{{ customer.nif }}</span>
                  <button
                    type="button"
                    data-row-action
                    class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    :aria-label="t('Customers.nif.copy')"
                    @click="copyNif(customer.nif)"
                  >
                    <Icon icon="carbon:copy" class="size-3.5" />
                  </button>
                </div>
                <span v-else class="text-gray-400">{{ t('Customers.emptyValue') }}</span>
              </td>

              <td class="py-4 pr-4 align-middle text-sm text-gray-700">
                <button
                  v-if="customer.referralCustomerId"
                  type="button"
                  data-row-action
                  class="cursor-pointer font-medium text-gray-900 underline-offset-2 hover:underline"
                  :aria-label="t('Customers.referral.open', { name: customer.referral })"
                  @click="openCustomer(customer.referralCustomerId)"
                >
                  {{ customer.referral }}
                </button>
                <span v-else>{{ optionalDisplay(customer.referral) }}</span>
                <p v-if="customer.referredCount > 0" class="mt-0.5 text-xs text-gray-400">
                  {{ t('Customers.referral.referred', { count: customer.referredCount }) }}
                </p>
              </td>

              <td class="py-4 pr-4 align-middle">
                <RankPatch v-if="customer.rank" variant="table" :rank="customer.rank" />
                <span v-else class="text-sm text-gray-400">{{ t('Customers.emptyValue') }}</span>
              </td>

              <td class="py-4 pr-4 align-middle text-sm text-gray-700">
                {{ formatRegistrationDate(customer.createdAt) }}
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
        summary-mode="range"
        page-size-placement="top"
        :previous-label="t('Customers.pagination.previous')"
        :next-label="t('Customers.pagination.next')"
        :of-label="t('Customers.pagination.of')"
        :results-label="customerCountLabel(total)"
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
      :open="detailCustomerId !== null"
      width-class="w-full max-w-md"
      @close="closeCustomer"
    >
      <CustomerDetailPanel
        v-if="detailCustomer"
        :customer="detailCustomer"
        @close="closeCustomer"
        @open-customer="openCustomer"
        @remove="openRemoveModal(detailCustomer.id)"
      />
      <p v-else-if="isDetailLoading" class="p-6 text-sm text-gray-400">
        {{ t('Customers.detail.loading') }}
      </p>
    </Drawer>

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
  </PageContainer>
</template>
