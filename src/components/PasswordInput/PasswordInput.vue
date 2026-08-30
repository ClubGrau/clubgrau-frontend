<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import PasswordRevealler from '../PasswordRevealler.vue';

defineOptions({ inheritAttrs: false });

export type PasswordInputVariant = 'login' | 'field' | 'modal';

const props = withDefaults(
  defineProps<{
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    showLabel: string;
    hideLabel: string;
    variant?: PasswordInputVariant;
    autocomplete?: string;
  }>(),
  {
    placeholder: '',
    disabled: false,
    invalid: false,
    variant: 'field',
  },
);

const modelValue = defineModel<string>({ required: true });
const attrs = useAttrs();

const showPassword = ref(false);

const inputType = computed(() => (showPassword.value ? 'text' : 'password'));
</script>

<template>
  <div class="relative">
    <input
      v-bind="attrs"
      :id="id"
      v-model="modelValue"
      :type="inputType"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :aria-invalid="invalid || undefined"
      class="password-input"
      :class="[
        `password-input--${variant}`,
        { 'password-input--invalid': invalid },
      ]"
    />
    <PasswordRevealler
      v-model="showPassword"
      :show-label="showLabel"
      :hide-label="hideLabel"
    />
  </div>
</template>

<style scoped>
@reference "../../style.css";

.password-input {
  @apply w-full pr-11 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60;
}

.password-input--login {
  @apply rounded-lg border border-transparent bg-gray-100 px-4 py-3 text-sm text-[#092D4D] placeholder:text-gray-400 focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/30;
}

.password-input--field {
  @apply rounded-lg border border-gray-200 bg-[#f7f7f8] px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e69138] focus:bg-white focus:ring-2 focus:ring-[#e69138]/20;
}

.password-input--modal {
  @apply rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:bg-white;
}

.password-input--invalid.password-input--login {
  @apply border-red-300 focus:border-red-400 focus:ring-red-200;
}

.password-input--invalid.password-input--field {
  @apply border-red-300 focus:border-red-400 focus:ring-red-200;
}

.password-input--invalid.password-input--modal {
  @apply border-red-300 focus:border-red-400 focus:ring-red-200;
}
</style>
