<script setup lang="ts">
import { onUnmounted, useId, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  open: boolean
  title: string
  description: string
}>()

const titleId = useId()
const descriptionId = useId()

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-[#092D4D]/60" aria-hidden="true" />

      <div
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        class="relative z-10 w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-[0_12px_32px_rgba(16,22,37,0.16)]"
      >
        <div class="mb-4 flex size-11 items-center justify-center rounded-full bg-amber-100">
          <Icon icon="carbon:warning-alt" class="size-5 text-amber-700" />
        </div>

        <h2 :id="titleId" class="text-lg font-semibold text-[#092D4D]">
          {{ title }}
        </h2>
        <p :id="descriptionId" class="mt-2 text-sm font-light leading-5 text-gray-500">
          {{ description }}
        </p>

        <div v-if="$slots.actions" class="mt-6 flex flex-col gap-3">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
