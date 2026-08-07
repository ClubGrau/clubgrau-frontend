<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import type {
  SelectFilterOption,
  SelectFilterPlacement,
  SelectFilterValue,
  SelectFilterVariant,
} from '../../types/select-filter';

const props = withDefaults(
  defineProps<{
    modelValue: SelectFilterValue;
    options: SelectFilterOption[];
    placeholder?: string;
    variant?: SelectFilterVariant;
    placement?: SelectFilterPlacement;
    disabled?: boolean;
  }>(),
  {
    placeholder: 'Selecionar',
    variant: 'pill',
    placement: 'bottom',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: SelectFilterValue];
  change: [value: SelectFilterValue];
}>();

const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const variantClasses: Record<
  SelectFilterVariant,
  {
    trigger: string;
    menu: string;
    option: string;
    chevron: string;
  }
> = {
  pill: {
    trigger:
      'min-w-[180px] rounded-full border border-gray-200 bg-white py-2.5 pr-9 pl-4 text-sm',
    menu: 'rounded-2xl border border-gray-100 bg-white p-1.5 shadow-[0_12px_32px_rgba(16,22,37,0.12)]',
    option: 'rounded-xl px-3 py-2 text-sm',
    chevron: 'right-3 size-4',
  },
  compact: {
    trigger:
      'min-w-[52px] rounded-md border border-gray-200 bg-white py-1 pr-7 pl-2.5 text-sm',
    menu: 'rounded-xl border border-gray-100 bg-white p-1 shadow-[0_10px_24px_rgba(16,22,37,0.12)]',
    option: 'rounded-lg px-2.5 py-1.5 text-sm',
    chevron: 'right-1.5 size-3.5',
  },
  field: {
    trigger:
      'w-full rounded-lg border border-gray-200 bg-[#f7f7f8] py-2.5 pr-9 pl-3.5 text-sm',
    menu: 'rounded-xl border border-gray-100 bg-white p-1.5 shadow-[0_12px_32px_rgba(16,22,37,0.12)]',
    option: 'rounded-lg px-3 py-2 text-sm',
    chevron: 'right-3 size-4',
  },
};

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
);

const displayLabel = computed(
  () => selectedOption.value?.label ?? props.placeholder,
);

const hasSelection = computed(() => selectedOption.value !== undefined);

const placementClasses: Record<SelectFilterPlacement, string> = {
  bottom: 'top-[calc(100%+6px)] right-0',
  left: 'top-[calc(100%+6px)] left-0',
  right: 'top-[calc(100%+6px)] right-0',
  top: 'bottom-[calc(100%+6px)] left-0',
};

const transitionFromClass = computed(() =>
  props.placement === 'top'
    ? '-translate-y-1 scale-95 opacity-0'
    : 'translate-y-1 scale-95 opacity-0',
);

const transitionLeaveToClass = computed(() =>
  props.placement === 'top'
    ? '-translate-y-1 scale-95 opacity-0'
    : 'translate-y-1 scale-95 opacity-0',
);

const toggle = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const selectOption = (option: SelectFilterOption) => {
  if (option.disabled) return;

  emit('update:modelValue', option.value);
  emit('change', option.value);
  close();
};

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node | null;
  if (!rootRef.value || !target) return;
  if (!rootRef.value.contains(target)) close();
};

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close();
};

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onDocumentKeydown);
});
</script>

<template>
  <div
    ref="rootRef"
    class="relative"
    :class="variant === 'field' ? 'block w-full' : 'inline-block'"
  >
    <button
      type="button"
      class="flex w-full cursor-pointer items-center justify-between text-left outline-none transition-colors"
      :class="[
        variantClasses[variant].trigger,
        hasSelection
          ? variant === 'field'
            ? 'text-gray-900'
            : 'text-gray-700'
          : 'text-gray-500',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : variant === 'field'
            ? 'hover:border-gray-300 focus:border-[#e69138] focus:bg-white focus:ring-2 focus:ring-[#e69138]/20'
            : 'hover:border-gray-300 focus:border-gray-300',
        isOpen
          ? variant === 'field'
            ? 'border-[#e69138] bg-white ring-2 ring-[#e69138]/20'
            : 'border-gray-300'
          : '',
      ]"
      :disabled="disabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <slot name="trigger" :label="displayLabel" :open="isOpen" :selected="selectedOption">
        <span class="truncate">{{ displayLabel }}</span>
      </slot>

      <Icon
        icon="carbon:chevron-down"
        class="pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 transition-transform"
        :class="[variantClasses[variant].chevron, isOpen ? 'rotate-180' : '']"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      :enter-from-class="transitionFromClass"
      enter-to-class="translate-y-0 scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 scale-100 opacity-100"
      :leave-to-class="transitionLeaveToClass"
    >
      <ul
        v-if="isOpen"
        role="listbox"
        class="absolute z-20 max-h-56 min-w-full overflow-y-auto"
        :class="[variantClasses[variant].menu, placementClasses[placement]]"
      >
        <li
          v-for="option in options"
          :key="option.id ?? option.value"
          role="option"
          :aria-selected="option.value === modelValue"
          :aria-disabled="option.disabled || undefined"
        >
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between text-left transition-colors"
            :class="[
              variantClasses[variant].option,
              option.disabled
                ? 'cursor-not-allowed text-gray-300'
                : option.value === modelValue
                  ? 'bg-[#335C65]/10 font-medium text-[#335C65]'
                  : 'text-gray-600 hover:bg-[#f3f3f5]',
            ]"
            :disabled="option.disabled"
            @click="selectOption(option)"
          >
            <slot
              name="option"
              :option="option"
              :selected="option.value === modelValue"
            >
              <span class="truncate">{{ option.label }}</span>
              <Icon
                v-if="option.value === modelValue"
                icon="carbon:checkmark"
                class="ml-2 size-4 shrink-0 text-[#335C65]"
              />
            </slot>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
