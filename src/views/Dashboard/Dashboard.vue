<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import PageHeader from '../../components/PageHeader/PageHeader.vue';
import RankPatch from '../Customers/RankPatch.vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import PageContainer from '../../Layout/PageContainer.vue';
import { useDashboardScreen } from '../../composables/dashboard/useDashboardScreen';
import { formatRegistrationDate, joinedSharePercent } from '../../domain/customer-wallet';
import {
  barPercent,
  formatEuro,
  formatSignedPercent,
  sharePercent,
} from '../../domain/dashboard';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import type { DashboardStockTone } from '../../types/dashboard';

const ARC_RADIUS = 54;
const ARC_LENGTH = Math.PI * ARC_RADIUS;

const stockBarClass: Record<DashboardStockTone, string> = {
  warning: 'bg-[#e69138]',
  danger: 'bg-[#d64545]',
  success: 'bg-[#1f9d55]',
};

const { t, locale } = useI18n();
const {
  summary,
  recentCustomers,
  operations,
  revenueThisMonth,
  currentMonth,
  isWalletLoading,
  isOperationsLoading,
} = useDashboardScreen();

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { id: 'dashboard', label: t('Dashboard.breadcrumb') },
]);

const joinedShare = computed(() =>
  joinedSharePercent(summary.value.joinedThisMonth, summary.value.total),
);

const treatmentPercent = computed(() => {
  const snapshot = operations.value;
  if (!snapshot) return 0;
  return sharePercent(snapshot.treatmentCompleted, snapshot.treatmentTotal);
});

const treatmentDash = computed(() => (ARC_LENGTH * treatmentPercent.value) / 100);

const revenueBars = computed(() => {
  const months = operations.value?.revenueByMonth ?? [];
  const max = Math.max(...months.map((item) => item.amount), 0);
  return months.map((item) => ({
    month: item.month,
    amount: item.amount,
    height: Math.max(barPercent(item.amount, max), 8),
    label: new Intl.DateTimeFormat(locale.value, { month: 'short' })
      .format(new Date(2026, item.month - 1, 1))
      .replace('.', ''),
    current: item.month === currentMonth.value,
  }));
});

const money = (amount: number) => formatEuro(amount, locale.value);
</script>

<template>
  <PageContainer>
    <Breadcrumb :items="breadcrumbItems" />

    <PageHeader :title="t('Dashboard.title')" :subtitle="t('Dashboard.subtitle')">
      <template #actions>
        <div class="flex flex-wrap gap-2">
          <span
            class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700"
          >
            <Icon icon="carbon:home" class="size-4 text-gray-400" />
            {{ t('Dashboard.context.salon') }}
          </span>
          <span
            class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700"
          >
            <Icon icon="carbon:calendar" class="size-4 text-gray-400" />
            {{ t('Dashboard.context.today') }}
          </span>
        </div>
      </template>
    </PageHeader>

    <div class="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl bg-[#e69138] p-5 text-white shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-medium text-white/80">{{ t('Dashboard.kpi.clients.label') }}</p>
          <span class="flex size-9 items-center justify-center rounded-lg bg-white/20">
            <Icon icon="carbon:user-multiple" class="size-5" />
          </span>
        </div>
        <p v-if="isWalletLoading" class="mt-4 h-9 w-16 animate-pulse rounded-md bg-white/30" />
        <p v-else class="mt-3 text-4xl font-bold tracking-tight">{{ summary.total }}</p>
        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/80">
          <span class="rounded-full bg-white/20 px-2 py-0.5 font-semibold text-white">
            {{ t('Dashboard.kpi.clients.joined', { count: summary.joinedThisMonth }) }}
          </span>
          <span>
            {{ t('Dashboard.kpi.clients.description', { percent: joinedShare }) }}
          </span>
        </div>
      </article>

      <article class="rounded-2xl bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm text-gray-500">{{ t('Dashboard.kpi.appointments.label') }}</p>
          <span class="flex size-9 items-center justify-center rounded-lg bg-[#f3f3f5] text-gray-500">
            <Icon icon="carbon:calendar" class="size-5" />
          </span>
        </div>
        <p v-if="isOperationsLoading" class="mt-4 h-9 w-12 animate-pulse rounded-md bg-gray-200" />
        <p v-else class="mt-3 text-4xl font-bold tracking-tight text-gray-900">
          {{ operations?.appointmentsToday ?? 0 }}
        </p>
        <p class="mt-3 text-xs text-gray-400">
          <span class="font-semibold text-[#1f9d55]">
            {{ formatSignedPercent(operations?.appointmentsDeltaPercent ?? 0) }}
          </span>
          {{ t('Dashboard.kpi.appointments.description') }}
        </p>
      </article>

      <article class="rounded-2xl bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm text-gray-500">{{ t('Dashboard.kpi.revenue.label') }}</p>
          <span class="flex size-9 items-center justify-center rounded-lg bg-[#f3f3f5] text-gray-500">
            <Icon icon="carbon:currency" class="size-5" />
          </span>
        </div>
        <p v-if="isOperationsLoading" class="mt-4 h-9 w-28 animate-pulse rounded-md bg-gray-200" />
        <p v-else class="mt-3 text-4xl font-bold tracking-tight text-gray-900">
          {{ money(revenueThisMonth) }}
        </p>
        <p class="mt-3 text-xs text-gray-400">
          <span class="font-semibold text-[#1f9d55]">
            {{ formatSignedPercent(operations?.revenueDeltaPercent ?? 0) }}
          </span>
          {{ t('Dashboard.kpi.revenue.description') }}
        </p>
      </article>

      <div
        class="flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 p-5 text-gray-400"
      >
        <span class="flex size-10 items-center justify-center rounded-xl border border-dashed border-gray-300">
          <Icon icon="carbon:add" class="size-5" />
        </span>
        <p class="text-sm font-medium">{{ t('Dashboard.kpi.newMetric') }}</p>
      </div>
    </div>

    <div class="mb-4 grid gap-4 lg:grid-cols-5">
      <section class="rounded-2xl bg-white p-5 shadow-sm lg:col-span-3">
        <h2 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Icon icon="carbon:calendar" class="size-5 text-gray-400" />
          {{ t('Dashboard.appointments.title') }}
        </h2>
        <ul class="space-y-1">
          <li
            v-for="appointment in operations?.appointments ?? []"
            :key="appointment.id"
            class="flex items-center gap-4 rounded-xl px-3 py-2.5"
            :class="appointment.current ? 'border-l-2 border-[#e69138] bg-[#fff4e5]' : ''"
          >
            <span class="w-12 shrink-0 text-sm text-gray-400">{{ appointment.time }}</span>
            <div class="min-w-0">
              <p class="truncate text-sm text-gray-800">
                <span
                  class="mr-2 font-semibold"
                  :class="appointment.current ? 'text-[#e69138]' : 'text-gray-900'"
                >
                  {{ appointment.time }}
                </span>
                {{ appointment.clientName }}
                ({{ t(`Dashboard.service.${appointment.service}`) }})
              </p>
              <p class="text-xs text-gray-400">
                {{ t('Dashboard.appointments.chair', { chair: appointment.chair }) }}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section class="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
        <h2 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Icon icon="carbon:chart-column" class="size-5 text-gray-400" />
          {{ t('Dashboard.revenue.title') }}
        </h2>
        <div
          class="flex h-52 items-end gap-2"
          role="img"
          :aria-label="t('Dashboard.revenue.title')"
        >
          <div
            v-for="bar in revenueBars"
            :key="bar.month"
            class="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              class="w-full rounded-t-md"
              :class="bar.current ? 'bg-[#e69138]' : 'bg-[#e69138]/25'"
              :style="{ height: `${bar.height}%` }"
              :title="money(bar.amount)"
            />
            <span class="text-[10px] tracking-wide text-gray-400 uppercase">{{ bar.label }}</span>
          </div>
        </div>
      </section>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <section class="rounded-2xl bg-white p-5 shadow-sm">
        <h2 class="mb-2 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Icon icon="carbon:chart-ring" class="size-5 text-gray-400" />
          {{ t('Dashboard.treatment.title') }}
        </h2>
        <div class="relative mx-auto mt-2 w-full max-w-56">
          <svg viewBox="0 0 140 86" class="w-full" aria-hidden="true">
            <path
              d="M 16 72 A 54 54 0 0 1 124 72"
              fill="none"
              stroke="#ececf0"
              stroke-width="12"
              stroke-linecap="round"
            />
            <path
              d="M 16 72 A 54 54 0 0 1 124 72"
              fill="none"
              stroke="#e69138"
              stroke-width="12"
              stroke-linecap="round"
              :stroke-dasharray="`${treatmentDash} ${ARC_LENGTH}`"
            />
          </svg>
          <p class="absolute inset-x-0 bottom-1 text-center text-3xl font-bold text-gray-900">
            {{ treatmentPercent }}%
          </p>
        </div>
        <p v-if="operations" class="mt-2 text-center text-xs text-gray-400">
          {{
            t('Dashboard.treatment.caption', {
              completed: operations.treatmentCompleted,
              total: operations.treatmentTotal,
            })
          }}
        </p>
      </section>

      <section class="rounded-2xl bg-white p-5 shadow-sm">
        <h2 class="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Icon icon="carbon:inventory-management" class="size-5 text-gray-400" />
          {{ t('Dashboard.stock.title') }}
        </h2>
        <ul class="space-y-4">
          <li v-for="item in operations?.stock ?? []" :key="item.id">
            <div class="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span class="font-medium text-gray-800">{{ t(`Dashboard.stock.${item.id}`) }}</span>
              <span class="shrink-0 text-xs text-gray-400">
                {{ t('Dashboard.stock.remaining', { count: item.remaining }) }}
              </span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-[#ececf0]">
              <div
                class="h-full rounded-full"
                :class="stockBarClass[item.tone]"
                :style="{ width: `${barPercent(item.remaining, item.capacity)}%` }"
              />
            </div>
          </li>
        </ul>
      </section>

      <section class="rounded-2xl bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Icon icon="carbon:user-multiple" class="size-5 text-gray-400" />
            {{ t('Dashboard.recent.title') }}
          </h2>
          <RouterLink
            to="/app/customers"
            class="text-sm font-medium text-[#e69138] hover:underline"
          >
            {{ t('Dashboard.recent.viewAll') }}
          </RouterLink>
        </div>
        <p v-if="isWalletLoading" class="h-24 animate-pulse rounded-xl bg-gray-100" />
        <p v-else-if="recentCustomers.length === 0" class="text-sm text-gray-400">
          {{ t('Dashboard.recent.empty') }}
        </p>
        <ul v-else class="space-y-4">
          <li
            v-for="customer in recentCustomers"
            :key="customer.id"
            class="flex items-center gap-3"
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
    </div>
  </PageContainer>
</template>
