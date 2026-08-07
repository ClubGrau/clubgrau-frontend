<script setup lang="ts">
import type { StatusBadgeSize, StatusBadgeVariant } from '../../types/status-badge';

interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  size?: StatusBadgeSize;
}

withDefaults(
  defineProps<StatusBadgeProps>(),
  {
    variant: 'success',
    size: 'md',
  },
);

const variantClasses: Record<StatusBadgeVariant, string> = {
  success: 'bg-[#e8f8ef] text-[#1f9d55]',
  warning: 'bg-[#fff4e5] text-[#c47a12]',
  danger: 'bg-[#fde8e8] text-[#d64545]',
};

const sizeClasses: Record<StatusBadgeSize, string> = {
  sm: 'px-2.5 py-0.5',
  md: 'px-3 py-1',
};
</script>

<template>
  <span
    class="inline-flex rounded-full text-xs font-semibold"
    :class="[variantClasses[variant], sizeClasses[size]]"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
