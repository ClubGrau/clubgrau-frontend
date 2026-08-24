<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { Icon } from '@iconify/vue';

interface ModalState {
  open: boolean;
  widthClass?: string;
}

const props = withDefaults(defineProps<ModalState>(), {
  widthClass: 'w-full max-w-md',
});

const emit = defineEmits<{
  close: [];
}>();

const close = () => {
  emit('close');
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    close();
  }
};

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  },
);

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/40"
        aria-hidden="true"
        @click="close"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 scale-95 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="translate-y-2 scale-95 opacity-0"
    >
      <div
        v-if="open"
        class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="pointer-events-auto flex max-h-[min(90vh,40rem)] w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_12px_32px_rgba(16,22,37,0.16)]"
          :class="widthClass"
          role="dialog"
          aria-modal="true"
        >
          <header class="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
            <div class="min-w-0 flex-1">
              <slot />
            </div>
            <button
              type="button"
              class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Fechar"
              @click="close"
            >
              <Icon icon="carbon:close" class="size-5" />
            </button>
          </header>

          <footer
            v-if="$slots.footer"
            class="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-white px-5 py-4"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
