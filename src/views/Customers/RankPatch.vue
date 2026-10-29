<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { customerRankPatch } from '../../constants/customer-rank';
import type { CustomerRank } from '../../types/customer';

const props = withDefaults(
  defineProps<{
    rank: CustomerRank;
    selected?: boolean;
    interactive?: boolean;
    variant?: 'tab' | 'table';
    ariaLabel?: string;
    count?: number;
  }>(),
  {
    selected: false,
    interactive: false,
    variant: 'table',
  },
);

const config = computed(() => customerRankPatch[props.rank]);

const rootClass = computed(() => {
  if (props.variant === 'tab') {
    return [
      'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
      props.selected ? [config.value.tone, 'font-medium'] : 'text-gray-500 hover:text-gray-700',
    ];
  }

  return [
    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap',
    config.value.tone,
  ];
});

const iconClass = computed(() =>
  props.variant === 'tab' ? 'size-3.5 shrink-0' : 'size-3 shrink-0',
);
</script>

<template>
  <component
    :is="interactive ? 'button' : 'span'"
    :type="interactive ? 'button' : undefined"
    :class="rootClass"
    :role="variant === 'tab' ? 'tab' : undefined"
    :aria-selected="variant === 'tab' ? selected : undefined"
    :aria-pressed="interactive && variant !== 'tab' ? selected : undefined"
    :aria-label="ariaLabel"
  >
    <Icon :icon="config.icon" :class="iconClass" />
    {{ config.label }}
    <span v-if="count != null" class="tabular-nums">{{ count }}</span>
  </component>
</template>
