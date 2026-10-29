<script setup lang="ts">
import { computed } from 'vue';

export interface WalletMixSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

const props = defineProps<{
  segments: WalletMixSegment[];
}>();

const total = computed(() => props.segments.reduce((sum, segment) => sum + segment.value, 0));

const painted = computed(() =>
  props.segments
    .filter((segment) => segment.value > 0 && total.value > 0)
    .map((segment) => ({
      ...segment,
      percent: (segment.value / total.value) * 100,
    })),
);
</script>

<template>
  <div class="mt-2.5 flex min-h-0 flex-col justify-center overflow-hidden">
    <div class="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
      <span
        v-for="segment in painted"
        :key="segment.id"
        class="h-full"
        :style="{ width: `${segment.percent}%`, backgroundColor: segment.color }"
      />
    </div>
    <ul class="mt-2.5 space-y-1">
      <li v-for="segment in segments" :key="segment.id" class="flex min-w-0 items-center gap-1.5">
        <span class="size-1.5 shrink-0 rounded-full" :style="{ backgroundColor: segment.color }" />
        <span class="min-w-0 flex-1 truncate text-[11px] leading-tight text-gray-700">{{ segment.label }}</span>
        <span class="text-xs font-semibold text-gray-900 tabular-nums">{{ segment.value }}</span>
      </li>
    </ul>
  </div>
</template>
