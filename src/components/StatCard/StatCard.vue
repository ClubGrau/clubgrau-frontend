<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { StatCardItem, StatCardTone } from '../../types/stat-card';

withDefaults(defineProps<StatCardItem>(), {
  tone: 'neutral',
});

const iconTone: Record<StatCardTone, string> = {
  neutral: 'text-gray-600',
  success: 'text-[#1f9d55]',
  warning: 'text-[#c47a12]',
  danger: 'text-[#d64545]',
};
</script>

<template>
  <div class="flex h-auto flex-col rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm">
    <div class="flex items-center gap-2">
      <span
        v-if="icon || $slots.icon"
        class="flex size-4 shrink-0 items-center justify-center bg-gray-200 w-8 h-8 rounded-full"
        :class="iconTone[tone]"
      >
        <slot name="icon">
          <Icon v-if="icon" :icon="icon" class="size-4" />
        </slot>
      </span>
      <p class="truncate text-sm font-medium text-gray-500">
        <slot name="label">{{ label }}</slot>
      </p>
    </div>

    <p class="mt-3 text-[2rem] leading-none font-bold tracking-tight text-gray-900">
      <slot name="value">{{ value }}</slot>
    </p>

    <p
      v-if="description || $slots.description"
      class="mt-2 truncate text-xs text-gray-400"
    >
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>
