<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  percent: number;
  joined: number;
  existing: number;
  joinedLabel: string;
  existingLabel: string;
  centerCaption: string;
}>();

const radius = 42;
const circumference = 2 * Math.PI * radius;

const share = computed(() => Math.min(100, Math.max(0, props.percent)));
const dashOffset = computed(() => circumference * (1 - share.value / 100));
</script>

<template>
  <div class="flex shrink-0 items-center gap-3">
    <svg class="size-20 shrink-0" viewBox="0 0 120 120" aria-hidden="true">
      <circle
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        stroke="#e5e7eb"
        stroke-width="12"
      />
      <circle
        v-if="share > 0"
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        stroke="#1f9d55"
        stroke-width="12"
        stroke-linecap="butt"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 60 60)"
      />
      <text
        x="60"
        y="56"
        text-anchor="middle"
        fill="#111827"
        font-size="22"
        font-weight="700"
      >
        {{ share }}%
      </text>
      <text x="60" y="74" text-anchor="middle" fill="#6b7280" font-size="11">
        {{ centerCaption }}
      </text>
    </svg>

    <ul class="min-w-0 space-y-2">
      <li class="flex items-center gap-2">
        <span class="size-2 shrink-0 rounded-full bg-[#1f9d55]" />
        <span class="text-xs text-gray-500">{{ joinedLabel }}</span>
        <span class="text-sm font-semibold text-gray-900">{{ joined }}</span>
      </li>
      <li class="flex items-center gap-2">
        <span class="size-2 shrink-0 rounded-full bg-gray-300" />
        <span class="text-xs text-gray-500">{{ existingLabel }}</span>
        <span class="text-sm font-semibold text-gray-900">{{ existing }}</span>
      </li>
    </ul>
  </div>
</template>
