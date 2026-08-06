<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { BreadcrumbItem } from '../../types/breadcrumb';

interface Props {
  items: BreadcrumbItem[];
  separator?: string;
}

withDefaults(
  defineProps<Props>(),
  {
    separator: '>',
  },
);
</script>

<template>
  <nav aria-label="Breadcrumb" class="mb-4 text-sm text-gray-400">
    <ol class="flex flex-wrap items-center">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="flex items-center"
      >
        <span v-if="index > 0" class="mx-1.5" aria-hidden="true">
          {{ separator }}
        </span>

        <RouterLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="transition-colors hover:text-gray-600"
        >
          {{ item.label }}
        </RouterLink>

        <span
          v-else
          :class="index === items.length - 1 ? 'text-gray-600' : undefined"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
