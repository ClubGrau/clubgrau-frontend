<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { StatCardItem, StatCardTone } from '../../types/stat-card';

withDefaults(
  defineProps<
    StatCardItem & {
      density?: 'default' | 'compact';
    }
  >(),
  {
    tone: 'neutral',
    density: 'default',
  },
);

const iconTone: Record<StatCardTone, string> = {
  neutral: 'text-gray-600',
  success: 'text-[#1f9d55]',
  warning: 'text-[#c47a12]',
  danger: 'text-[#d64545]',
};

const iconWell: Record<StatCardTone, string> = {
  neutral: 'bg-gray-100 text-gray-600',
  success: 'bg-[#1f9d55]/10 text-[#1f9d55]',
  warning: 'bg-[#c47a12]/12 text-[#c47a12]',
  danger: 'bg-[#d64545]/10 text-[#d64545]',
};
</script>

<template>
  <div
    class="flex h-full min-h-0 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm"
    :class="density === 'compact' ? 'px-3.5 py-3' : 'px-5 py-4'"
  >
    <div class="flex items-center gap-2">
      <span
        v-if="icon || $slots.icon"
        class="flex shrink-0 items-center justify-center rounded-full"
        :class="
          density === 'compact'
            ? ['size-7', iconWell[tone]]
            : ['size-4 w-8 h-8 bg-gray-200', iconTone[tone]]
        "
      >
        <slot name="icon">
          <Icon
            v-if="icon"
            :icon="icon"
            :class="density === 'compact' ? 'size-3.5' : 'size-4'"
          />
        </slot>
      </span>
      <p
        class="truncate font-medium text-gray-500"
        :class="density === 'compact' ? 'text-xs' : 'text-sm'"
      >
        <slot name="label">{{ label }}</slot>
      </p>
    </div>

    <slot name="body">
      <div
        class="flex items-center justify-between gap-3"
        :class="density === 'compact' ? 'mt-2.5' : 'mt-3'"
      >
        <p
          class="min-w-0 leading-none font-bold tracking-tight text-gray-900 tabular-nums"
          :class="density === 'compact' ? 'text-2xl' : 'text-[2rem]'"
        >
          <slot name="value">{{ value }}</slot>
        </p>
        <slot name="chart" />
      </div>

      <p
        v-if="description || $slots.description"
        class="truncate text-xs text-gray-400"
        :class="density === 'compact' ? 'mt-1.5' : 'mt-2'"
      >
        <slot name="description">{{ description }}</slot>
      </p>
    </slot>

    <slot name="footer" />
  </div>
</template>
