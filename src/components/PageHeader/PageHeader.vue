<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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

    <div v-if="$slots.actions" class="w-full shrink-0 md:w-auto">
      <slot name="actions" />
    </div>
  </div>
</template>
