<script setup lang="ts">
import type { CSSProperties } from 'vue';

defineProps<{
  open: boolean;
  menuStyle: CSSProperties;
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      data-actions-menu
      role="menu"
      class="fixed z-50 min-w-40 rounded-xl border border-gray-100 bg-white p-1.5 shadow-[0_12px_32px_rgba(16,22,37,0.12)]"
      :style="menuStyle"
    >
      <slot />
    </div>
  </Teleport>
</template>
