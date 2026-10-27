<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import ActionsMenu from '../../components/ActionsMenu/ActionsMenu.vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import DataTable from '../../components/DataTable/DataTable.vue';
import Drawer from '../../components/Drawer/Drawer.vue';
import PageHeader from '../../components/PageHeader/PageHeader.vue';
import StatCard from '../../components/StatCard/StatCard.vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import ModalLayout from '../../components/Modal/ModalLayout.vue';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import type { Customer } from '../../types/customer';
import type { DataTableColumn, DataTablePagination } from '../../types/data-table';
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
  summary,
  hasSummary,
  joinedThisMonth,
  walletTotal,
  hasJoinedThisMonth,
  total,
  isListLoading,
  isListFetching,
  isListError,
  canRemove,
  isCreateDrawerOpen,
  isRemoveModalOpen,
  removeCustomerName,
  isCreating,
  isRemoving,
  indicationOrigins,
  isLoadingIndicationOrigins,
  indicationOriginsErrorKey,
  setCustomerWasReferred,
  setCustomerIndicationCategory,
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

const statCards = computed<StatCardItem[]>(() => {
  const cards: StatCardItem[] = [
    hasSummary.value
      ? {
          id: 'total',
          label: t('Customers.stats.total.label'),
          value: summary.value.total,
          description: t('Customers.stats.total.description'),
          icon: 'carbon:user-multiple',
          tone: 'neutral',
        }
      : {
          id: 'listed',
          label: t('Customers.stats.listed.label'),
          value: total.value,
          description: t('Customers.stats.listed.description'),
          icon: 'carbon:user-multiple',
          tone: 'neutral',
        },
  ];

  if (hasJoinedThisMonth.value) {
    cards.push({
      id: 'joinedThisMonth',
      label: t('Customers.stats.joinedThisMonth.label'),
      value: joinedThisMonth.value,
      description: t('Customers.stats.joinedThisMonth.description', {
        percent: joinedSharePercent(joinedThisMonth.value, walletTotal.value),
      }),
      icon: 'carbon:user-follow',
      tone: 'success',
    });
  }

  return cards;
});

const columns = computed<DataTableColumn[]>(() => {
  const base: DataTableColumn[] = [
    { key: 'name', label: t('Customers.table.customer') },
    { key: 'contact', label: t('Customers.table.contact') },
    { key: 'nif', label: t('Customers.table.nif') },
    { key: 'referral', label: t('Customers.table.referral') },
    { key: 'rank', label: t('Customers.table.rank') },
    { key: 'createdAt', label: t('Customers.table.registeredAt') },
  ];

  if (!canRemove.value) return base;

  return [
    ...base,
    {
      key: 'actions',
      label: t('Customers.table.actions'),
      align: 'right',
      stopsRowClick: true,
      actionsTrigger: true,
    },
  ];
});

const tablePagination = computed<DataTablePagination>(() => ({
  currentPage: currentPage.value,
  pageSize: pageSize.value,
  totalItems: total.value,
  summaryMode: 'range',
  pageSizePlacement: 'top',
  previousLabel: t('Customers.pagination.previous'),
  nextLabel: t('Customers.pagination.next'),
  ofLabel: t('Customers.pagination.of'),
  resultsLabel: customerCountLabel(total.value),
}));

const rankFilterLabel = (rank: (typeof CUSTOMER_RANK_LADDER)[number]) => {
  const rankLabel = t(`Customers.rank.${rank}`);
  if (rankFilter.value === rank) {
    return t('Customers.rankFilter.clear', { rank: rankLabel });
  }
  if (!hasSummary.value) {
    return t('Customers.rankFilter.applyName', { rank: rankLabel });
  }
  return t('Customers.rankFilter.apply', {
    rank: rankLabel,
    count: summary.value.byRank[rank],
  });
};

const onCustomerTableRowClick = (event: MouseEvent, customer: Customer.ListItem) => {
  onCustomerRowClick(event, customer.id);
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
  <PageContainer>
    <Breadcrumb :items="breadcrumbItems" />

    <PageHeader
      :title="t('Customers.title')"
      :subtitle="t('Customers.subtitle')"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f] md:w-auto"
          @click="openCreateDrawer"
        >
          {{ t('Customers.newCustomer') }}
          <span class="text-lg leading-none">+</span> 
        </button>
      </template>
    </PageHeader>

    <div
      class="mb-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scrollbar-none md:grid md:snap-none md:gap-4 md:overflow-visible [&::-webkit-scrollbar]:hidden"
      :class="statCards.length > 1 ? 'md:grid-cols-2 lg:w-[75%]' : 'md:max-w-md md:grid-cols-1'"
    >
      <StatCard
        v-for="card in statCards"
        :key="card.id"
        class="w-[calc(100%-3rem)] shrink-0 snap-start md:w-auto md:min-w-0 md:shrink md:snap-align-none"
        v-bind="card"
      />
    </div>

    <section class="rounded-2xl bg-white p-5 shadow-sm">
      <div class="mb-5 flex flex-col gap-3 min-[1100px]:flex-row min-[1100px]:items-center">
        <div class="relative w-full min-w-0 min-[1100px]:max-w-2/3 min-[1100px]:flex-1">
          <Icon
            icon="carbon:search"
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('Customers.searchPlaceholder')"
           class="w-full rounded-full border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/30"
          />
        </div>

        <div class="flex w-full min-w-0 items-center gap-2 max-[429px]:gap-1 min-[1100px]:w-auto min-[1100px]:shrink-0" role="group" :aria-label="t('Customers.rankFilter.label')">
          <RankPatch
            v-for="rank in CUSTOMER_RANK_LADDER"
            :key="rank"
            :rank="rank"
            variant="filter"
            interactive
            :count="hasSummary ? summary.byRank[rank] : undefined"
            :selected="rankFilter === rank"
            :aria-label="rankFilterLabel(rank)"
            @click="toggleRankFilter(rank)"
          />
        </div>
      </div>

      <p v-if="isListError" class="mb-3 text-sm text-red-600">
        {{ t('Customers.loadError') }}
      </p>

      <DataTable
        :columns="columns"
        :rows="filteredCustomers"
        row-key="id"
        :loading="isListLoading"
        :busy="isListFetching && !isListLoading"
        :label="isListLoading ? t('Customers.loading') : undefined"
        :pagination="tablePagination"
        @update:current-page="currentPage = $event"
        @update:page-size="pageSize = $event"
        @row-click="onCustomerTableRowClick"
      >
        <template #loading>
          <tr>
            <td :colspan="columns.length" class="py-12 text-center text-sm text-gray-400">
              {{ t('Customers.loading') }}
            </td>
          </tr>
        </template>

        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <UserAvatar
              :initials="row.initials"
              size="sm"
              :alt="row.name"
            />
            <button
              type="button"
              class="truncate text-left text-sm font-semibold text-gray-900 hover:underline"
              @click="openCustomer(row.id)"
            >
              {{ row.name }}
            </button>
          </div>
        </template>

        <template #cell-contact="{ row }">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Icon icon="carbon:email" class="size-3.5 shrink-0 text-gray-400" />
              <span class="truncate font-semibold">{{ optionalDisplay(row.email) }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Icon icon="carbon:phone" class="size-3.5 shrink-0 text-gray-400" />
              <span>{{ optionalDisplay(row.phone) }}</span>
            </div>
          </div>
        </template>

        <template #cell-nif="{ row }">
          <div class="text-sm text-gray-500">
            <div v-if="row.nif.trim()" class="flex items-center gap-1.5">
              <span>{{ row.nif }}</span>
              <button
                type="button"
                data-row-action
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                :aria-label="t('Customers.nif.copy')"
                @click="copyNif(row.nif)"
              >
                <Icon icon="carbon:copy" class="size-3.5" />
              </button>
            </div>
            <span v-else class="text-gray-400">{{ t('Customers.emptyValue') }}</span>
          </div>
        </template>

        <template #cell-referral="{ row }">
          <div class="text-sm text-gray-700">
            <button
              v-if="row.referralCustomerId"
              type="button"
              data-row-action
              class="cursor-pointer font-medium text-gray-900 underline-offset-2 hover:underline"
              :aria-label="t('Customers.referral.open', { name: row.referral })"
              @click="openCustomer(row.referralCustomerId)"
            >
              {{ row.referral }}
            </button>
            <span v-else>{{ optionalDisplay(row.referral) }}</span>
            <p v-if="row.referredCount > 0" class="mt-0.5 text-xs text-gray-400">
              {{ t('Customers.referral.referred', { count: row.referredCount }) }}
            </p>
          </div>
        </template>

        <template #cell-rank="{ row }">
          <RankPatch v-if="row.rank" variant="table" :rank="row.rank" />
          <span v-else class="text-sm text-gray-400">{{ t('Customers.emptyValue') }}</span>
        </template>

        <template #cell-createdAt="{ row }">
          <span class="text-sm text-gray-700">{{ formatRegistrationDate(row.createdAt) }}</span>
        </template>

        <template v-if="canRemove" #cell-actions="{ row }">
          <button
            type="button"
            class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            :aria-expanded="openActionsId === row.id"
            :aria-label="t('Customers.table.actions')"
            aria-haspopup="menu"
            @click.stop="toggleActionsMenu(row.id, $event.currentTarget)"
          >
            <Icon icon="carbon:overflow-menu-vertical" class="size-5" />
          </button>
        </template>

        <template #empty>
          {{ isListError ? t('Customers.loadError') : t('Customers.empty') }}
        </template>
      </DataTable>
    </section>

    <ActionsMenu v-if="canRemove" :open="openActionsId !== null" :menu-style="actionsMenuStyle">
      <button
        v-if="openActionsId"
        type="button"
        role="menuitem"
        class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
        @click.stop="onRemoveAction(openActionsId)"
      >
        <Icon icon="carbon:trash-can" class="size-4" />
        {{ t('Customers.menu.remove') }}
      </button>
    </ActionsMenu>

    <Drawer
      :open="detailCustomerId !== null"
      width-class="w-full max-w-3xl"
      @close="closeCustomer"
    >
      <CustomerDetailPanel
        v-if="detailCustomer"
        :customer="detailCustomer"
        :removable="canRemove"
        @close="closeCustomer"
        @open-customer="openCustomer"
        @remove="openRemoveModal(detailCustomer.id)"
      />
      <p v-else-if="isDetailLoading" class="p-6 text-sm text-gray-400">
        {{ t('Customers.detail.loading') }}
      </p>
      <p v-else class="p-6 text-sm text-gray-400">
        {{ t('Customers.detail.unavailable') }}
      </p>
    </Drawer>

    <Drawer
      :open="isCreateDrawerOpen"
      width-class="w-full max-w-3xl"
      @close="closeCreateDrawer"
    >
      <CustomerFormPanel
        :submitting="isCreating"
        :customers="filteredCustomers"
        :origins="indicationOrigins"
        :origins-loading="isLoadingIndicationOrigins"
        :origins-error-key="indicationOriginsErrorKey"
        @close="closeCreateDrawer"
        @create="handleCreateCustomer"
        @was-referred-change="setCustomerWasReferred"
        @category-change="setCustomerIndicationCategory"
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
