<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import PhoneInput from '../../components/PhoneInput/PhoneInput.vue';
import SelectFilter from '../../components/SelectFilter/SelectFilter.vue';
import type { Customer, CustomerRank } from '../../types/customer';
import type { Indication, IndicationCategoryId } from '../../types/indication';
import { FRIEND_CATEGORY_ID } from '../../types/indication';
import { CUSTOMER_RANK_OPTIONS } from '../../constants/customer-rank';
import { toCustomerIndication } from '../../domain/customer-indication';
import { isValidPhone } from '../../domain/phone-value';

const indicationTypes = ['canal', 'campanha', FRIEND_CATEGORY_ID] as const satisfies readonly IndicationCategoryId[];

const emit = defineEmits<{
  close: [];
  create: [payload: Customer.CreateCommand];
  wasReferredChange: [value: boolean];
  categoryChange: [categoryId: IndicationCategoryId | null];
}>();

const props = defineProps<{
  submitting?: boolean;
  customers: { id: string; name: string }[];
  origins: Indication.Origin[];
  originsLoading?: boolean;
  originsErrorKey?: string | null;
}>();

const { t } = useI18n();

const form = reactive({
  name: '',
  email: '',
  phone: '',
  nif: '',
  rank: '' as CustomerRank | '',
});

const wasReferred = ref(false);
const categoryId = ref('');
const originId = ref('');

const submitted = ref(false);

const isFriend = computed(() => categoryId.value === FRIEND_CATEGORY_ID);

const selectedOrigin = computed(
  () => props.origins.find((origin) => origin.id === originId.value) ?? null,
);

const selectedFriend = computed(
  () => props.customers.find((customer) => customer.id === originId.value) ?? null,
);

const missingRequired = computed(() => {
  const missing: string[] = [];
  if (form.name.trim().length <= 1) missing.push(t('Customers.form.nameRequired').replace(' *', ''));
  if (!form.email.trim().includes('@')) missing.push(t('Customers.form.emailRequired').replace(' *', ''));
  if (!isValidPhone(form.phone)) missing.push(t('Customers.form.phoneRequired').replace(' *', ''));
  if (wasReferred.value && !categoryId.value) {
    missing.push(t('Customers.form.indication.category'));
  }
  if (wasReferred.value && categoryId.value && !selectedOrigin.value && !selectedFriend.value) {
    missing.push(t('Customers.form.indication.origin'));
  }
  return missing;
});

const originOptions = computed(() =>
  props.origins.map((origin) => ({
    id: origin.id,
    label: origin.name,
    value: origin.id,
  })),
);

const friendOptions = computed(() =>
  props.customers
    .filter((customer) => customer.name.trim().length > 0)
    .map((customer) => ({
      id: customer.id,
      label: customer.name,
      value: customer.id,
    })),
);

const onWasReferred = (value: boolean) => {
  wasReferred.value = value;
  if (!value) {
    categoryId.value = '';
    originId.value = '';
    emit('categoryChange', null);
  }
  emit('wasReferredChange', value);
};

const onCategory = (value: IndicationCategoryId) => {
  if (categoryId.value === value) return;
  categoryId.value = value;
  originId.value = '';
  emit('categoryChange', value);
};

const fieldError = (value: string, minLength = 1) =>
  submitted.value && value.trim().length < minLength;

const onSubmit = () => {
  submitted.value = true;
  if (missingRequired.value.length > 0) return;

  const indication = toCustomerIndication({
    wasReferred: wasReferred.value,
    categoryId: categoryId.value,
    origin: isFriend.value ? null : selectedOrigin.value,
    friend: isFriend.value ? selectedFriend.value : null,
  });
  if (!indication) return;

  emit('create', {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    nif: form.nif.trim(),
    rank: form.rank,
    ...indication,
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

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            {{ t('Customers.form.indication.title') }}
          </h3>

          <fieldset class="space-y-2">
            <legend class="text-xs text-gray-400">
              {{ t('Customers.form.indication.wasReferred') }}
            </legend>
            <div class="flex gap-5">
              <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                <input
                  class="size-4 accent-[#3B82F6]"
                  type="radio"
                  name="customer-was-referred"
                  :checked="wasReferred"
                  @change="onWasReferred(true)"
                />
                {{ t('Customers.form.indication.yes') }}
              </label>
              <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                <input
                  class="size-4 accent-[#3B82F6]"
                  type="radio"
                  name="customer-was-referred"
                  :checked="!wasReferred"
                  @change="onWasReferred(false)"
                />
                {{ t('Customers.form.indication.no') }}
              </label>
            </div>
          </fieldset>

          <div v-if="wasReferred" class="mt-4 space-y-4">
            <fieldset class="space-y-2">
              <legend class="text-xs text-gray-400">
                {{ t('Customers.form.indication.category') }}
              </legend>
              <div class="flex flex-wrap gap-5">
                <label
                  v-for="typeId in indicationTypes"
                  :key="typeId"
                  class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-800"
                >
                  <input
                    class="size-4 accent-[#3B82F6]"
                    type="radio"
                    name="customer-indication-category"
                    :checked="categoryId === typeId"
                    @change="onCategory(typeId)"
                  />
                  {{ t(`Customers.form.indication.types.${typeId}`) }}
                </label>
              </div>
            </fieldset>

            <div v-if="categoryId" class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">
                {{ t('Customers.form.indication.origin') }}
              </span>
              <p
                v-if="!isFriend && originsLoading"
                class="flex items-center gap-2 text-sm text-gray-400"
                aria-live="polite"
              >
                <Icon icon="carbon:circle-dash" class="size-4 animate-spin text-[#e69138]" />
                {{ t('Customers.form.indication.loading') }}
              </p>
              <p v-else-if="!isFriend && originsErrorKey" class="text-sm text-red-500">
                {{ t(originsErrorKey) }}
              </p>
              <SelectFilter
                v-else-if="isFriend ? friendOptions.length : originOptions.length"
                v-model="originId"
                :options="isFriend ? friendOptions : originOptions"
                :placeholder="
                  t(
                    isFriend
                      ? 'Customers.form.indication.friendPlaceholder'
                      : 'Customers.form.indication.originPlaceholder',
                  )
                "
                variant="field"
              />
              <p v-else class="text-sm text-gray-400">
                {{
                  t(
                    isFriend
                      ? 'Customers.form.indication.emptyFriends'
                      : 'Customers.form.indication.emptyOrigins',
                  )
                }}
              </p>
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
