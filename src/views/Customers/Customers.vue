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
import type { CustomerRank } from '../../types/customer';
import { formatRegistrationDate, joinedSharePercent } from '../../domain/customer-wallet';
import { useToast } from '../../composables/useToast';
import { useCustomersScreen } from '../../composables/customers/useCustomersScreen';
import CustomerDetailPanel from './CustomerDetailPanel.vue';
import CustomerFormPanel from './CustomerFormPanel.vue';
import IndicationMix, { type WalletMixSegment } from '../../components/IndicationMix/IndicationMix.vue';
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
  isStatsLoading,
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

const joinedShare = computed(() =>
  joinedSharePercent(joinedThisMonth.value, walletTotal.value),
);

const joinedLastMonth = computed(() => summary.value.joinedLastMonth);

const intakeDelta = computed(() => joinedThisMonth.value - joinedLastMonth.value);

const intakeTone = computed(() => {
  const delta = intakeDelta.value;
  if (delta === 0) return 'neutral' as const;
  return delta > 0 ? ('success' as const) : ('danger' as const);
});

const intakeDeltaClass = computed(() => {
  const delta = intakeDelta.value;
  if (delta === 0) return 'text-gray-400';
  return delta > 0 ? 'text-[#1f9d55]' : 'text-[#d64545]';
});

const indicationSegments = computed<WalletMixSegment[]>(() => [
  {
    id: 'canal',
    label: t('Customers.stats.indication.canal'),
    value: summary.value.byIndication.canal,
    color: '#3b82f6',
  },
  {
    id: 'campanha',
    label: t('Customers.stats.indication.campanha'),
    value: summary.value.byIndication.campanha,
    color: '#e69138',
  },
  {
    id: 'amigo',
    label: t('Customers.stats.indication.amigo'),
    value: summary.value.byIndication.amigo,
    color: '#1f9d55',
  },
  {
    id: 'none',
    label: t('Customers.stats.indication.none'),
    value: summary.value.byIndication.none,
    color: '#64748b',
  },
]);

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

  if (hasJoinedThisMonth.value || isStatsLoading.value) {
    cards.push({
      id: 'joinedThisMonth',
      label: t('Customers.stats.joinedThisMonth.label'),
      value: joinedThisMonth.value,
      icon: 'carbon:user-follow',
      tone: intakeTone.value,
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

const tableTotal = computed(() => {
  const narrowing = rankFilter.value !== null || searchQuery.value.trim().length > 0;
  if (!narrowing && hasSummary.value) return walletTotal.value;
  return total.value;
});

const tablePagination = computed<DataTablePagination>(() => ({
  currentPage: currentPage.value,
  pageSize: pageSize.value,
  totalItems: tableTotal.value,
  summaryMode: 'range',
  pageSizePlacement: 'top',
  previousLabel: t('Customers.pagination.previous'),
  nextLabel: t('Customers.pagination.next'),
  ofLabel: t('Customers.pagination.of'),
  resultsLabel: customerCountLabel(total.value),
}));

const selectRankFilter = (rank: CustomerRank | null) => {
  if (rank === null) {
    if (rankFilter.value) toggleRankFilter(rankFilter.value);
    return;
  }
  if (rankFilter.value === rank) return;
  toggleRankFilter(rank);
};

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
      class="mb-6 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain scrollbar-none lg:grid lg:snap-none lg:grid-cols-4 lg:gap-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      <StatCard
        v-for="card in statCards"
        :key="card.id"
        density="compact"
        class="!h-44 w-[calc(100%-3rem)] shrink-0 snap-start overflow-hidden md:w-72 lg:w-auto lg:shrink lg:snap-align-none"
        v-bind="card"
      >
        <template v-if="isListLoading || (isStatsLoading && card.id === 'joinedThisMonth')" #value>
          <span
            class="block h-7 w-10 animate-pulse rounded-md bg-current/20"
            aria-hidden="true"
          />
        </template>
        <template v-if="card.id === 'joinedThisMonth'" #footer>
          <div v-if="isStatsLoading" class="mt-2 space-y-1.5" aria-hidden="true">
            <span class="block h-3 w-3/4 animate-pulse rounded bg-gray-100" />
            <span class="block h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
          <p v-else class="mt-2 flex min-w-0 items-start gap-1.5 text-xs leading-snug text-gray-600">
            <Icon
              icon="carbon:chart-line"
              class="mt-0.5 size-4 shrink-0"
              :class="intakeDeltaClass"
              aria-hidden="true"
            />
            <span class="min-w-0">
              <span class="block truncate">
                {{ t('Customers.stats.joinedThisMonth.lastMonthTotal', { count: joinedLastMonth }) }}
              </span>
              <span class="block truncate">
                {{ t('Customers.stats.joinedThisMonth.grewShare', { share: joinedShare }) }}
              </span>
            </span>
          </p>
        </template>
      </StatCard>

      <StatCard
        v-if="hasJoinedThisMonth || isStatsLoading"
        density="compact"
        class="!h-44 w-[calc(100%-3rem)] shrink-0 snap-start overflow-hidden md:w-72 lg:col-span-2 lg:w-auto lg:shrink lg:snap-align-none"
        :label="t('Customers.stats.indication.label')"
        icon="carbon:connect-source"
        value=""
      >
        <template #body>
          <div v-if="isStatsLoading" class="mt-2.5 space-y-2" aria-hidden="true">
            <span class="block h-1.5 w-full animate-pulse rounded-full bg-gray-100" />
            <span class="block h-2.5 animate-pulse rounded bg-gray-100" />
            <span class="block h-2.5 animate-pulse rounded bg-gray-100" />
            <span class="block h-2.5 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
          <IndicationMix v-else :segments="indicationSegments" />
        </template>
      </StatCard>
    </div>

    <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div class="mb-5 flex flex-col gap-3 min-[1100px]:flex-row min-[1100px]:items-center">
        <div
          class="flex w-full min-w-0 items-center gap-1 overflow-x-auto rounded-full bg-[#f3f3f5] p-1 scrollbar-none min-[1100px]:w-auto min-[1100px]:shrink-0 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          :aria-label="t('Customers.rankFilter.label')"
        >
          <button
            type="button"
            role="tab"
            class="shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors"
            :class="
              rankFilter === null
                ? 'bg-[#5c5c66] font-medium text-white'
                : 'text-gray-500 hover:text-gray-700'
            "
            :aria-selected="rankFilter === null"
            @click="selectRankFilter(null)"
          >
            {{ t('Customers.rankFilter.all') }}
          </button>
          <RankPatch
            v-for="rank in CUSTOMER_RANK_LADDER"
            :key="rank"
            :rank="rank"
            variant="tab"
            interactive
            :count="hasSummary ? summary.byRank[rank] : undefined"
            :selected="rankFilter === rank"
            :aria-label="rankFilterLabel(rank)"
            @click="selectRankFilter(rank)"
          />
        </div>

        <div class="relative w-full min-w-0 min-[1100px]:flex-1">
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
          <tr
            v-for="row in pageSize"
            :key="`skeleton-${row}`"
            class="border-b border-gray-50 last:border-b-0"
          >
            <td class="py-4 pr-4 align-middle">
              <div class="flex items-center gap-3">
                <div class="size-9 shrink-0 animate-pulse rounded-full bg-gray-100" />
                <div class="h-3.5 w-32 animate-pulse rounded bg-gray-100" />
              </div>
            </td>
            <td class="py-4 pr-4 align-middle">
              <div class="space-y-2">
                <div class="h-3 w-40 animate-pulse rounded bg-gray-100" />
                <div class="h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>
            </td>
            <td class="py-4 pr-4 align-middle">
              <div class="h-3.5 w-24 animate-pulse rounded bg-gray-100" />
            </td>
            <td class="py-4 pr-4 align-middle">
              <div class="space-y-2">
                <div class="h-3.5 w-28 animate-pulse rounded bg-gray-100" />
                <div class="h-3 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            </td>
            <td class="py-4 pr-4 align-middle">
              <div class="h-6 w-16 animate-pulse rounded-md bg-gray-100" />
            </td>
            <td class="py-4 pr-4 align-middle">
              <div class="h-3.5 w-20 animate-pulse rounded bg-gray-100" />
            </td>
            <td v-if="canRemove" class="py-4 pl-2 text-right align-middle">
              <div class="ml-auto size-5 animate-pulse rounded bg-gray-100" />
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
          <div v-if="row.email.trim() || row.phone.trim()" class="space-y-1">
            <div v-if="row.email.trim()" class="flex items-center gap-2 text-xs text-gray-500">
              <Icon icon="carbon:email" class="size-3.5 shrink-0 text-gray-400" />
              <span class="truncate font-semibold">{{ row.email }}</span>
            </div>
            <div v-if="row.phone.trim()" class="flex items-center gap-2 text-xs text-gray-500">
              <Icon icon="carbon:phone" class="size-3.5 shrink-0 text-gray-400" />
              <span>{{ row.phone }}</span>
            </div>
          </div>
          <span v-else class="text-sm text-gray-400">{{ t('Customers.emptyValue') }}</span>
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
