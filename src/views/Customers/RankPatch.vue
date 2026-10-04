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
    variant?: 'filter' | 'table';
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
  if (props.variant === 'filter') {
    return [
      'inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors max-[429px]:gap-1 max-[429px]:overflow-hidden max-[429px]:px-2 max-[429px]:py-1.5 max-[429px]:text-xs min-[1100px]:flex-none min-[1100px]:justify-start',
      props.selected
        ? [config.value.tone, 'border-transparent']
        : ['border-gray-200 bg-white text-gray-700', config.value.hoverTone],
    ];
  }

  return [
    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap',
    config.value.tone,
  ];
});

const iconClass = computed(() => {
  if (props.variant === 'filter') {
    const size = 'size-4 shrink-0 max-[429px]:size-3';
    return props.selected ? size : [size, config.value.iconTone];
  }

  return 'size-3 shrink-0';
});
</script>

<template>
  <component
    :is="interactive ? 'button' : 'span'"
    :type="interactive ? 'button' : undefined"
    :class="rootClass"
    :aria-pressed="interactive ? selected : undefined"
    :aria-label="ariaLabel"
  >
    <Icon :icon="config.icon" :class="iconClass" />
    {{ config.label }}
    <span v-if="count != null" class="tabular-nums">{{ count }}</span>
  </component>
</template>
