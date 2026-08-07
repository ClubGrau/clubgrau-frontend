<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';

interface DrawerState {
  open: boolean;
  widthClass?: string;
}
const props = withDefaults(
  defineProps<DrawerState>(),
  {
    widthClass: 'w-full max-w-md',
  },
);

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
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 flex h-full flex-col overflow-hidden bg-white shadow-xl"
        :class="widthClass"
        role="dialog"
        aria-modal="true"
      >
        <slot />
      </aside>
    </Transition>
  </Teleport>
</template>
