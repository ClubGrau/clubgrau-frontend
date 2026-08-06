<script setup lang="ts">
import type { StatCardItem, StatCardVariant } from '../../types/stat-card';

withDefaults(
  defineProps<StatCardItem>(),
  {
    variant: 'default',
  }
);

const variantClasses: Record<
  StatCardVariant,
  {
    root: string;
    label: string;
    value: string;
    description: string;
  }
> = {
  default: {
    root: 'bg-[#ececf0]',
    label: 'text-gray-500',
    value: 'text-gray-900',
    description: 'text-gray-400',
  },
  danger: {
    root: 'bg-[#f8eaea]',
    label: 'text-[#d64545]',
    value: 'text-[#d64545]',
    description: 'text-[#d64545]',
  },
};
</script>

<template>
  <div class="rounded-xl px-5 py-4" :class="variantClasses[variant].root">
    <p
      class="text-[11px] font-semibold tracking-wide uppercase"
      :class="variantClasses[variant].label"
    >
      <slot name="label">{{ label }}</slot>
    </p>

    <p class="mt-1 text-3xl font-bold" :class="variantClasses[variant].value">
      <slot name="value">{{ value }}</slot>
    </p>

    <p
      v-if="description || $slots.description"
      class="mt-1 text-xs"
      :class="variantClasses[variant].description"
    >
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>
