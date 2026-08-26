<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useToast } from '../../composables/useToast';

const { toasts, dismiss } = useToast();
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-6 bottom-6 z-60 flex w-full max-w-sm flex-col gap-3"
    >
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-x-4 opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="translate-x-4 opacity-0"
        move-class="transition duration-200"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 border-l-4 bg-white p-4 shadow-[0_12px_32px_rgba(16,22,37,0.16)]"
          :class="toast.variant === 'success' ? 'border-[#2f6f73]' : 'border-[#d64545]'"
          role="status"
        >
          <Icon
            :icon="toast.variant === 'success' ? 'carbon:checkmark-outline' : 'carbon:warning-alt'"
            class="mt-0.5 size-5 shrink-0"
            :class="toast.variant === 'success' ? 'text-[#2f6f73]' : 'text-[#d64545]'"
          />
          <p class="flex-1 text-sm leading-snug text-gray-700">{{ toast.message }}</p>
          <button
            type="button"
            class="shrink-0 cursor-pointer rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Dispensar"
            @click="dismiss(toast.id)"
          >
            <Icon icon="carbon:close" class="size-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
