<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import IndicationMix, { type WalletMixSegment } from '../../components/IndicationMix/IndicationMix.vue';
import { CUSTOMER_RANK_LADDER } from '../../constants/customer-rank';
import { joinedSharePercent, type CustomerWalletSummary } from '../../domain/customer-wallet';
import type { CustomerRank } from '../../types/customer';
import RankPatch from '../Customers/RankPatch.vue';

const rankBarClass: Record<CustomerRank, string> = {
  GOLD: 'bg-[#d4a017]',
  SILVER: 'bg-[#8b95a1]',
  BRONZE: 'bg-[#c47a3a]',
};

const props = defineProps<{
  summary: CustomerWalletSummary;
  loading: boolean;
  error: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();

const indicationSegments = computed<WalletMixSegment[]>(() => [
  {
    id: 'canal',
    label: t('Dashboard.indication.canal'),
    value: props.summary.byIndication.canal,
    color: '#3b82f6',
  },
  {
    id: 'campanha',
    label: t('Dashboard.indication.campanha'),
    value: props.summary.byIndication.campanha,
    color: '#e69138',
  },
  {
    id: 'amigo',
    label: t('Dashboard.indication.amigo'),
    value: props.summary.byIndication.amigo,
    color: '#1f9d55',
  },
  {
    id: 'none',
    label: t('Dashboard.indication.none'),
    value: props.summary.byIndication.none,
    color: '#64748b',
  },
]);

const rankWidth = (rank: CustomerRank) => {
  const count = props.summary.byRank[rank];
  const share = joinedSharePercent(count, props.summary.total);
  if (count <= 0) return 0;
  return Math.max(share, 4);
};
</script>

<template>
  <div class="flex h-full flex-col bg-[#f7f7f8]">
    <header class="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="min-w-0 truncate text-lg font-semibold text-gray-900">
          {{ t('Dashboard.composition.title') }}
        </h2>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          :aria-label="t('Dashboard.composition.close')"
          @click="emit('close')"
        >
          <Icon icon="carbon:close" class="size-5" />
        </button>
      </div>
    </header>

    <div class="flex-1 space-y-4 overflow-y-auto px-5 py-5">
      <p v-if="error" class="text-sm text-red-600">
        {{ t('Dashboard.loadError') }}
      </p>

      <template v-else>
        <section class="rounded-2xl bg-white p-4">
          <h3 class="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Icon icon="carbon:badge" class="size-5 text-gray-400" />
            {{ t('Dashboard.ranks.title') }}
          </h3>
          <p class="mt-1 text-xs text-gray-400">{{ t('Dashboard.ranks.caption') }}</p>
          <ul v-if="loading" class="mt-5 space-y-4" aria-hidden="true">
            <li v-for="rank in CUSTOMER_RANK_LADDER" :key="rank" class="space-y-2">
              <span class="block h-6 w-24 animate-pulse rounded-md bg-gray-100" />
              <span class="block h-2 animate-pulse rounded-full bg-gray-100" />
            </li>
          </ul>
          <ul v-else class="mt-5 space-y-4">
            <li v-for="rank in CUSTOMER_RANK_LADDER" :key="rank">
              <div class="mb-1.5 flex items-center justify-between gap-3">
                <RankPatch :rank="rank" />
                <span class="text-sm font-semibold text-gray-900 tabular-nums">
                  {{ summary.byRank[rank] }}
                </span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-[#ececf0]">
                <div
                  class="h-full rounded-full"
                  :class="rankBarClass[rank]"
                  :style="{ width: `${rankWidth(rank)}%` }"
                />
              </div>
            </li>
          </ul>
        </section>

        <section class="rounded-2xl bg-white p-4">
          <h3 class="mb-2 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Icon icon="carbon:connect-source" class="size-5 text-gray-400" />
            {{ t('Dashboard.indication.title') }}
          </h3>
          <div v-if="loading" class="mt-4 space-y-2" aria-hidden="true">
            <span class="block h-1.5 w-full animate-pulse rounded-full bg-gray-100" />
            <span class="block h-3 animate-pulse rounded bg-gray-100" />
            <span class="block h-3 animate-pulse rounded bg-gray-100" />
            <span class="block h-3 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
          <IndicationMix v-else :segments="indicationSegments" />
        </section>
      </template>
    </div>
  </div>
</template>
