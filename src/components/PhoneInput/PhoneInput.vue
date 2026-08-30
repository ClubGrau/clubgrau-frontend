<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { VueTelInput } from 'vue-tel-input';
import type { PhoneObject } from 'vue-tel-input';
import type { CountryCode } from 'libphonenumber-js';
import { toNationalPhoneDisplay } from '../../domain/phone-value';
import 'vue-tel-input/vue-tel-input.css';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    defaultCountry?: string;
  }>(),
  {
    placeholder: '912 345 678',
    disabled: false,
    invalid: false,
    defaultCountry: 'PT',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  validate: [isValid: boolean];
}>();

const preferredCountries = ['PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'ES', 'FR', 'DE', 'GB', 'US'];

const inputOptions = computed(() => ({
  id: props.id,
  placeholder: props.placeholder,
  showDialCode: false,
  styleClasses: 'phone-input__field',
}));

const dropdownOptions = {
  showDialCodeInList: true,
  showDialCodeInSelection: true,
  showFlags: true,
  showSearchBox: true,
  searchBoxPlaceholder: 'Buscar país...',
};

const inputValue = ref('');
let lastEmitted = '';

watch(
  () => props.modelValue,
  (value) => {
    if (value === lastEmitted) return;
    inputValue.value = toNationalPhoneDisplay(value, props.defaultCountry as CountryCode);
    lastEmitted = value;
  },
  { immediate: true },
);

const onInput = (_number: string, phoneObject: PhoneObject) => {
  lastEmitted = phoneObject.number || '';
  emit('update:modelValue', lastEmitted);
  emit('validate', Boolean(phoneObject.isValid));
};

const onValidate = (phoneObject: PhoneObject) => {
  emit('validate', Boolean(phoneObject.isValid));
};
</script>

<template>
  <div class="phone-input-root" :class="{ 'is-invalid': invalid }">
    <VueTelInput
      v-model="inputValue"
      mode="national"
      :default-country="defaultCountry"
      :auto-default-country="false"
      :auto-format="true"
      :valid-characters-only="true"
      :disabled="disabled"
      :preferred-countries="preferredCountries"
      :input-options="inputOptions"
      :dropdown-options="dropdownOptions"
      style-classes="phone-input"
      @on-input="onInput"
      @validate="onValidate"
    />
  </div>
</template>

<style scoped>
@reference "../../style.css";

.phone-input-root :deep(.vue-tel-input.phone-input) {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f7f7f8;
  box-shadow: none !important;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.phone-input-root :deep(.vue-tel-input.phone-input:focus-within) {
  border-color: #e69138 !important;
  background-color: #fff;
  box-shadow: 0 0 0 2px rgb(230 145 56 / 0.2) !important;
}

.phone-input-root.is-invalid :deep(.vue-tel-input.phone-input) {
  border-color: #fca5a5;
}

.phone-input-root.is-invalid :deep(.vue-tel-input.phone-input:focus-within) {
  border-color: #f87171 !important;
  box-shadow: 0 0 0 2px rgb(254 202 202 / 0.8) !important;
}

.phone-input-root :deep(.vti__dropdown) {
  display: flex;
  align-items: center;
  padding: 0 0.625rem 0 0.875rem;
  border: 0;
  border-radius: 0.5rem 0 0 0.5rem;
  background: transparent !important;
}

.phone-input-root :deep(.vti__dropdown:hover),
.phone-input-root :deep(.vti__dropdown.open) {
  background: transparent !important;
}

.phone-input-root :deep(.vti__selection) {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
}

.phone-input-root :deep(.vti__dropdown-arrow) {
  color: #9ca3af;
  border-top-color: #9ca3af;
  transform: scale(0.85);
}

.phone-input-root :deep(.vti__flag) {
  margin-right: 0.125rem;
  transform: scale(0.95);
}

.phone-input-root :deep(.vti__input),
.phone-input-root :deep(.phone-input__field) {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 42px;
  border: 0 !important;
  border-radius: 0 0.5rem 0.5rem 0;
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  padding: 0.625rem 0.875rem 0.625rem 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #111827;
}

.phone-input-root :deep(.vti__input::placeholder),
.phone-input-root :deep(.phone-input__field::placeholder) {
  color: #9ca3af;
}

.phone-input-root :deep(.vti__dropdown-list) {
  z-index: 60;
  width: 18rem;
  max-height: 15rem;
  margin-top: 0.35rem;
  overflow-y: auto;
  border: 1px solid #f3f4f6;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 12px 32px rgb(16 22 37 / 0.12);
}

.phone-input-root :deep(.vti__dropdown-list.below),
.phone-input-root :deep(.vti__dropdown-list.above) {
  border: 1px solid #f3f4f6;
}

.phone-input-root :deep(.vti__dropdown-item) {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #374151;
}

.phone-input-root :deep(.vti__dropdown-item:hover),
.phone-input-root :deep(.vti__dropdown-item.highlighted) {
  background: #f7f7f8;
}

.phone-input-root :deep(.vti__search_box) {
  width: calc(100% - 1rem);
  margin: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
  font-size: 0.875rem;
  outline: none;
}

.phone-input-root :deep(.vti__search_box:focus) {
  border-color: #e69138;
  box-shadow: 0 0 0 2px rgb(230 145 56 / 0.2);
}
</style>
