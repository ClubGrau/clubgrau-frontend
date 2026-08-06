<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="mb-6 flex items-end justify-between gap-4">
    <div class="min-w-0">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        <slot name="title">{{ title }}</slot>
      </h1>

      <p v-if="subtitle && !$slots.subtitle" class="mt-1 text-sm text-gray-400">
        {{ subtitle }}
      </p>
      <div v-else-if="$slots.subtitle" class="mt-1 text-sm text-gray-400">
        <slot name="subtitle" />
      </div>
    </div>

    <div v-if="$slots.actions" class="shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
