<script setup lang="ts">
defineProps<{
  showLabel: string
  hideLabel: string
}>()

const visible = defineModel<boolean>({ required: true })
</script>

<template>
  <button
    type="button"
    class="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-gray-400 transition-colors hover:text-[#092D4D]"
    :aria-label="visible ? hideLabel : showLabel"
    @click="visible = !visible"
  >
    <svg
      v-if="!visible"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-5"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-5"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.4 5.5A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2" />
      <path d="M6.7 6.7C3.9 8.6 2 12 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4.4-1" />
    </svg>
  </button>
</template>
