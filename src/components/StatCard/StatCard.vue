<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { StatCardItem, StatCardTone } from '../../types/stat-card';

withDefaults(defineProps<StatCardItem>(), {
  tone: 'neutral',
});

const toneClasses: Record<
  StatCardTone,
  {
    root: string;
    label: string;
    value: string;
    description: string;
    icon: string;
  }
> = {
  neutral: {
    root: 'bg-[#ececf0]',
    label: 'text-gray-500',
    value: 'text-gray-900',
    description: 'text-gray-400',
    icon: 'bg-white/80 text-gray-600',
  },
  success: {
    root: 'bg-[#e8f8ef]',
    label: 'text-[#1f9d55]',
    value: 'text-[#1f9d55]',
    description: 'text-[#1f9d55]/75',
    icon: 'bg-white/80 text-[#1f9d55]',
  },
  warning: {
    root: 'bg-[#fff4e5]',
    label: 'text-[#c47a12]',
    value: 'text-[#c47a12]',
    description: 'text-[#c47a12]/75',
    icon: 'bg-white/80 text-[#c47a12]',
  },
  danger: {
    root: 'bg-[#fde8e8]',
    label: 'text-[#d64545]',
    value: 'text-[#d64545]',
    description: 'text-[#d64545]/75',
    icon: 'bg-white/80 text-[#d64545]',
  },
};
</script>

<template>
  <div class="rounded-xl px-5 py-4" :class="toneClasses[tone].root">
    <div class="flex items-start justify-between gap-3">
      <p
        class="text-[11px] font-semibold tracking-wide uppercase"
        :class="toneClasses[tone].label"
      >
        <slot name="label">{{ label }}</slot>
      </p>

      <div
        v-if="icon || $slots.icon"
        class="flex size-9 shrink-0 items-center justify-center rounded-lg"
        :class="toneClasses[tone].icon"
      >
        <slot name="icon">
          <Icon v-if="icon" :icon="icon" class="size-5" />
        </slot>
      </div>
    </div>

    <p class="mt-1 text-3xl font-bold" :class="toneClasses[tone].value">
      <slot name="value">{{ value }}</slot>
    </p>

    <p
      v-if="description || $slots.description"
      class="mt-1 text-xs"
      :class="toneClasses[tone].description"
    >
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>
