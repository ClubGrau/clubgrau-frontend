<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import PasswordInput from '../../components/PasswordInput/PasswordInput.vue';

const props = defineProps<{
  customerName: string;
  isSubmitting: boolean;
  errorMessage: string | null;
}>();

const emit = defineEmits<{
  submit: [password: string];
  cancel: [];
}>();

const { t } = useI18n();

const password = ref('');

const clearPassword = () => {
  password.value = '';
};

const submit = () => {
  if (props.isSubmitting || !password.value) return;
  const value = password.value;
  clearPassword();
  emit('submit', value);
};

const cancel = () => {
  clearPassword();
  emit('cancel');
};

onUnmounted(clearPassword);

const removeBody = computed(() =>
  props.customerName
    ? t('Customers.modal.removeBodyNamed', { name: props.customerName })
    : t('Customers.modal.removeBodyAnonymous'),
);
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="submit">
    <div>
      <h2 class="text-lg font-semibold text-gray-900">
        {{ t('Customers.modal.removeTitle') }}
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        {{ removeBody }}
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="remove-customer-actor-password" class="text-sm text-gray-500">
        {{ t('Customers.modal.actorPassword') }}
      </label>
      <PasswordInput
        id="remove-customer-actor-password"
        v-model="password"
        variant="modal"
        autocomplete="current-password"
        :placeholder="t('Customers.modal.passwordPlaceholder')"
        :show-label="t('Customers.modal.showPassword')"
        :hide-label="t('Customers.modal.hidePassword')"
        :disabled="isSubmitting"
        :invalid="Boolean(errorMessage)"
        :aria-describedby="errorMessage ? 'remove-customer-actor-password-error' : undefined"
      />
      <p
        v-if="errorMessage"
        id="remove-customer-actor-password-error"
        class="text-sm text-red-600"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </div>

    <div class="flex items-center justify-end gap-3 pt-1">
      <button
        type="button"
        class="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        :disabled="isSubmitting"
        @click="cancel"
      >
        {{ t('Customers.actions.cancel') }}
      </button>
      <button
        type="submit"
        class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#d64545] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c13c3c] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isSubmitting || !password"
        :aria-busy="isSubmitting"
      >
        <Icon
          v-if="isSubmitting"
          icon="carbon:circle-dash"
          class="size-4 animate-spin"
        />
        {{ t('Customers.actions.remove') }}
      </button>
    </div>
  </form>
</template>
