<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import Drawer from '../../components/Drawer/Drawer.vue';
import PageHeader from '../../components/PageHeader/PageHeader.vue';
import StatCard from '../../components/StatCard/StatCard.vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import PageContainer from '../../Layout/PageContainer.vue';
import RankPatch from '../Customers/RankPatch.vue';
import { useDashboardScreen } from '../../composables/dashboard/useDashboardScreen';
import { formatRegistrationDate, joinedSharePercent } from '../../domain/customer-wallet';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import WalletCompositionPanel from './WalletCompositionPanel.vue';

const { t } = useI18n();
const {
  summary,
  recentCustomers,
  includeFloor,
  team,
  origins,
  isWalletLoading,
  isWalletError,
  isRecentLoading,
  isRecentError,
  isTeamLoading,
  isCatalogLoading,
  isTeamError,
  isCatalogError,
} = useDashboardScreen();

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { id: 'dashboard', label: t('Dashboard.breadcrumb') },
]);

const joinedShare = computed(() =>
  joinedSharePercent(summary.value.joinedThisMonth, summary.value.total),
);

const intakeDelta = computed(
  () => summary.value.joinedThisMonth - summary.value.joinedLastMonth,
);

const intakeTone = computed(() => {
  if (intakeDelta.value === 0) return 'neutral' as const;
  return intakeDelta.value > 0 ? ('success' as const) : ('danger' as const);
});

const intakeDeltaClass = computed(() => {
  if (intakeDelta.value === 0) return 'text-gray-400';
  return intakeDelta.value > 0 ? 'text-[#1f9d55]' : 'text-[#d64545]';
});

const isCompositionOpen = ref(false);
</script>

<template>
  <PageContainer>
    <Breadcrumb :items="breadcrumbItems" />

    <PageHeader :title="t('Dashboard.title')" :subtitle="t('Dashboard.subtitle')">
      <template #actions>
        <RouterLink
          to="/app/customers"
          class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f] md:w-auto"
        >
          <Icon icon="carbon:user-multiple" class="size-4" />
          {{ t('Dashboard.actions.customers') }}
        </RouterLink>
      </template>
    </PageHeader>

    <p v-if="isWalletError" class="mb-4 text-sm text-red-600">
      {{ t('Dashboard.loadError') }}
    </p>

    <div
      v-if="!isWalletError || includeFloor"
      class="mb-4 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain scrollbar-none lg:grid lg:snap-none lg:gap-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      :class="!isWalletError && includeFloor ? 'lg:grid-cols-3' : 'lg:grid-cols-2'"
    >
      <template v-if="!isWalletError">
        <StatCard
          density="compact"
          class="!h-40 w-[calc(100%-3rem)] shrink-0 snap-start md:w-72 lg:w-auto lg:shrink lg:snap-align-none"
          :label="t('Dashboard.kpi.total.label')"
          :value="summary.total"
          :description="t('Dashboard.kpi.total.description')"
          icon="carbon:user-multiple"
          tone="neutral"
        >
          <template v-if="isWalletLoading" #value>
            <span class="block h-7 w-10 animate-pulse rounded-md bg-current/20" aria-hidden="true" />
          </template>
        </StatCard>

        <StatCard
          density="compact"
          class="!h-40 w-[calc(100%-3rem)] shrink-0 snap-start md:w-72 lg:w-auto lg:shrink lg:snap-align-none"
          :label="t('Dashboard.kpi.joined.label')"
          :value="summary.joinedThisMonth"
          icon="carbon:user-follow"
          :tone="intakeTone"
        >
          <template v-if="isWalletLoading" #value>
            <span class="block h-7 w-10 animate-pulse rounded-md bg-current/20" aria-hidden="true" />
          </template>
          <template #footer>
            <div v-if="isWalletLoading" class="mt-2 space-y-1.5" aria-hidden="true">
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
                  {{ t('Dashboard.kpi.joined.lastMonth', { count: summary.joinedLastMonth }) }}
                </span>
                <span class="block truncate">
                  {{ t('Dashboard.kpi.joined.share', { percent: joinedShare }) }}
                </span>
              </span>
            </p>
          </template>
        </StatCard>
      </template>

      <section
        v-if="includeFloor"
        class="flex !h-40 w-[calc(100%-3rem)] shrink-0 snap-start flex-col rounded-2xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm md:w-72 lg:w-auto lg:shrink lg:snap-align-none"
      >
        <div class="flex items-center justify-between gap-2">
          <h2 class="flex min-w-0 items-center gap-2 text-xs font-medium text-gray-500">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <Icon icon="carbon:connect" class="size-3.5" />
            </span>
            <span class="truncate">{{ t('Dashboard.catalog.title') }}</span>
          </h2>
          <RouterLink
            to="/app/indications"
            class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-[#f7f7f8] px-3 py-1.5 text-xs font-semibold text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
          >
            {{ t('Dashboard.catalog.viewAll') }}
          </RouterLink>
        </div>
        <p v-if="isCatalogError" class="mt-2 text-xs text-red-600">
          {{ t('Dashboard.catalog.error') }}
        </p>
        <ul v-else class="mt-auto space-y-2">
          <li class="flex items-center justify-between gap-3">
            <span class="text-sm text-gray-700">{{ t('Dashboard.catalog.canal') }}</span>
            <span v-if="isCatalogLoading" class="h-4 w-16 animate-pulse rounded bg-gray-100" />
            <span v-else class="text-sm font-semibold text-gray-900 tabular-nums">
              {{ t('Dashboard.catalog.active', { count: origins.canal }) }}
            </span>
          </li>
          <li class="flex items-center justify-between gap-3">
            <span class="text-sm text-gray-700">{{ t('Dashboard.catalog.campanha') }}</span>
            <span v-if="isCatalogLoading" class="h-4 w-16 animate-pulse rounded bg-gray-100" />
            <span v-else class="text-sm font-semibold text-gray-900 tabular-nums">
              {{ t('Dashboard.catalog.active', { count: origins.campanha }) }}
            </span>
          </li>
        </ul>
      </section>
    </div>

    <div class="grid gap-4" :class="includeFloor ? 'xl:grid-cols-2' : ''">
      <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Icon icon="carbon:user-multiple" class="size-5 text-gray-400" />
            {{ t('Dashboard.recent.title') }}
          </h2>
          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-[#f7f7f8] px-3 py-1.5 text-sm font-semibold text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
              @click="isCompositionOpen = true"
            >
              {{ t('Dashboard.recent.composition') }}
            </button>
            <RouterLink
              to="/app/customers"
              class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-[#f7f7f8] px-3 py-1.5 text-sm font-semibold text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
            >
              {{ t('Dashboard.recent.viewAll') }}
            </RouterLink>
          </div>
        </div>
        <div v-if="isRecentLoading" class="divide-y divide-gray-100" aria-hidden="true">
          <div v-for="row in 3" :key="row" class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span class="size-8 animate-pulse rounded-full bg-gray-100" />
            <span class="h-3 w-32 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <p v-else-if="isRecentError" class="text-sm text-red-600">
          {{ t('Dashboard.recent.error') }}
        </p>
        <p v-else-if="recentCustomers.length === 0" class="text-sm text-gray-400">
          {{ t('Dashboard.recent.empty') }}
        </p>
        <ul v-else class="divide-y divide-gray-100">
          <li
            v-for="customer in recentCustomers"
            :key="customer.id"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <UserAvatar :initials="customer.initials" size="sm" :alt="customer.name" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-gray-900">{{ customer.name }}</p>
              <p class="text-xs text-gray-400">{{ formatRegistrationDate(customer.createdAt) }}</p>
            </div>
            <RankPatch v-if="customer.rank" :rank="customer.rank" />
          </li>
        </ul>
      </section>

      <section v-if="includeFloor" class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Icon icon="clarity:employee-line" class="size-5 text-gray-400" />
              {{ t('Dashboard.team.title') }}
            </h2>
            <RouterLink
              to="/app/employees"
              class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-[#f7f7f8] px-3 py-1.5 text-sm font-semibold text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
            >
              {{ t('Dashboard.team.viewAll') }}
            </RouterLink>
          </div>
          <p v-if="isTeamError" class="text-sm text-red-600">{{ t('Dashboard.team.error') }}</p>
          <ul v-else class="grid grid-cols-3 gap-3">
            <li>
              <p class="text-xs text-gray-400">{{ t('Dashboard.team.active') }}</p>
              <p v-if="isTeamLoading" class="mt-2 h-7 w-8 animate-pulse rounded bg-gray-100" />
              <p v-else class="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{{ team.active }}</p>
            </li>
            <li>
              <p class="text-xs text-gray-400">{{ t('Dashboard.team.vacation') }}</p>
              <p v-if="isTeamLoading" class="mt-2 h-7 w-8 animate-pulse rounded bg-gray-100" />
              <p v-else class="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{{ team.vacation }}</p>
            </li>
            <li>
              <p class="text-xs text-gray-400">{{ t('Dashboard.team.inactive') }}</p>
              <p v-if="isTeamLoading" class="mt-2 h-7 w-8 animate-pulse rounded bg-gray-100" />
              <p v-else class="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{{ team.inactive }}</p>
            </li>
          </ul>
      </section>
    </div>

    <Drawer
      :open="isCompositionOpen"
      width-class="w-full max-w-3xl"
      @close="isCompositionOpen = false"
    >
      <WalletCompositionPanel
        :summary="summary"
        :loading="isWalletLoading"
        :error="isWalletError"
        @close="isCompositionOpen = false"
      />
    </Drawer>
  </PageContainer>
</template>
