<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import PhoneInput from '../../components/PhoneInput/PhoneInput.vue';
import SelectFilter from '../../components/SelectFilter/SelectFilter.vue';
import type { Customer, CustomerRank } from '../../types/customer';
import { CUSTOMER_RANK_OPTIONS } from '../../constants/customer-rank';
import { isValidPhone } from '../../domain/phone-value';

const emit = defineEmits<{
  close: [];
  create: [payload: Customer.CreateCommand];
}>();

defineProps<{
  submitting?: boolean;
}>();

const { t } = useI18n();

const form = reactive({
  name: '',
  email: '',
  phone: '',
  nif: '',
  referral: '',
  rank: '' as CustomerRank | '',
});

const submitted = ref(false);

const missingRequired = computed(() => {
  const missing: string[] = [];
  if (form.name.trim().length <= 1) missing.push(t('Customers.form.nameRequired').replace(' *', ''));
  if (!form.email.trim().includes('@')) missing.push(t('Customers.form.emailRequired').replace(' *', ''));
  if (!isValidPhone(form.phone)) missing.push(t('Customers.form.phoneRequired').replace(' *', ''));
  return missing;
});

const fieldError = (value: string, minLength = 1) =>
  submitted.value && value.trim().length < minLength;

const onSubmit = () => {
  submitted.value = true;
  if (missingRequired.value.length > 0) return;

  emit('create', {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    nif: form.nif.trim(),
    referral: form.referral.trim(),
    rank: form.rank,
  });
};
</script>

<template>
  <div class="flex h-full flex-col bg-[#f7f7f8]">
    <header class="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            {{ t('Customers.form.createTitle') }}
          </h2>
          <p class="mt-0.5 text-sm text-gray-400">
            {{ t('Customers.form.createSubtitle') }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          :aria-label="t('Customers.actions.close')"
          @click="emit('close')"
        >
          <Icon icon="carbon:close" class="size-5" />
        </button>
      </div>
    </header>

    <form class="flex min-h-0 flex-1 flex-col" @submit.prevent="onSubmit">
      <div class="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            {{ t('Customers.form.sectionMain') }}
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="customer-name" class="text-xs text-gray-400">
                {{ t('Customers.form.nameRequired') }}
              </label>
              <input
                id="customer-name"
                v-model="form.name"
                type="text"
                :placeholder="t('Customers.form.namePlaceholder')"
                class="form-input"
                :class="{ 'form-input-error': fieldError(form.name, 2) }"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="customer-email" class="text-xs text-gray-400">
                {{ t('Customers.form.emailRequired') }}
              </label>
              <input
                id="customer-email"
                v-model="form.email"
                type="email"
                :placeholder="t('Customers.form.emailPlaceholder')"
                class="form-input"
                :class="{ 'form-input-error': submitted && !form.email.includes('@') }"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="customer-phone" class="text-xs text-gray-400">
                {{ t('Customers.form.phoneRequired') }}
              </label>
              <PhoneInput
                id="customer-phone"
                v-model="form.phone"
                :placeholder="t('Customers.form.phonePlaceholder')"
                :invalid="submitted && !isValidPhone(form.phone)"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="customer-nif" class="text-xs text-gray-400">
                {{ t('Customers.form.nif') }}
              </label>
              <input
                id="customer-nif"
                v-model="form.nif"
                type="text"
                :placeholder="t('Customers.form.nifPlaceholder')"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="customer-referral" class="text-xs text-gray-400">
                {{ t('Customers.form.referral') }}
              </label>
              <input
                id="customer-referral"
                v-model="form.referral"
                type="text"
                :placeholder="t('Customers.form.referralPlaceholder')"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">{{ t('Customers.form.rank') }}</span>
              <SelectFilter
                v-model="form.rank"
                :options="CUSTOMER_RANK_OPTIONS"
                :placeholder="t('Customers.form.rankPlaceholder')"
                variant="field"
              />
            </div>
          </div>
        </section>

        <p v-if="submitted && missingRequired.length" class="text-sm text-red-500">
          {{ t('Customers.form.missingFields', { fields: missingRequired.join(', ') }) }}
        </p>
      </div>

      <footer
        class="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-white px-5 py-4"
      >
        <button
          type="button"
          class="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          @click="emit('close')"
        >
          {{ t('Customers.actions.cancel') }}
        </button>
        <button
          type="submit"
          class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="submitting"
          :aria-busy="submitting"
        >
          <Icon
            v-if="submitting"
            icon="carbon:circle-dash"
            class="size-4 animate-spin"
          />
          {{ t('Customers.form.createSubmit') }}
        </button>
      </footer>
    </form>
  </div>
</template>

<style scoped>
@reference "../../style.css";

.form-input {
  @apply w-full rounded-lg border border-gray-200 bg-[#f7f7f8] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#e69138] focus:bg-white focus:ring-2 focus:ring-[#e69138]/20;
}

.form-input-error {
  @apply border-red-300 focus:border-red-400 focus:ring-red-200;
}
</style>
