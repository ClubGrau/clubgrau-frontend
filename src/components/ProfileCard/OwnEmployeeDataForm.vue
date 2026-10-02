<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import PhoneInput from '../PhoneInput/PhoneInput.vue';
import SelectFilter from '../SelectFilter/SelectFilter.vue';
import { genderOptionValue, toGenderSelectOptions } from '../../constants/employee-gender';
import { hasPhoneNumber, isValidPhone } from '../../domain/phone-value';
import type { SelectFilterOption } from '../../types/select-filter';
import type { Employee } from '../../types/employee';

interface OwnEmployeeDataFormProps {
  employee: Employee.ListItem | null;
  loadFailed?: boolean;
  submitting?: boolean;
}

const props = defineProps<OwnEmployeeDataFormProps>();

const emit = defineEmits<{
  close: [];
  retry: [];
  save: [payload: Employee.UpdateOwnDataCommand];
}>();

const { t } = useI18n();

const genderOptions = computed<SelectFilterOption[]>(() =>
  toGenderSelectOptions((key) => t(key)),
);

const form = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  nif: '',
  gender: '',
  address: '',
  languages: '',
  emergencyContact: '',
});

const submitted = ref(false);
const hydrated = ref(false);

function formText(value: string | null | undefined): string {
  return value ?? '';
}

const fillForm = (employee: Employee.ListItem) => {
  form.name = formText(employee.name);
  form.username = formText(employee.username);
  form.email = formText(employee.email);
  form.phone = formText(employee.phone);
  form.nif = formText(employee.nif);
  form.gender = genderOptionValue(employee.gender ?? null);
  form.address = formText(employee.address);
  form.languages = formText(employee.languages);
  form.emergencyContact = formText(employee.emergencyContact);
  submitted.value = false;
};

watch(
  () => props.employee,
  (employee) => {
    if (!employee || hydrated.value) return;
    fillForm(employee);
    hydrated.value = true;
  },
  { immediate: true },
);

const hasEmergencyContact = computed(() => hasPhoneNumber(form.emergencyContact));

const missingRequired = computed(() => {
  const missing: string[] = [];
  if (form.name.trim().length <= 1) missing.push(t('ProfileCard.form.name'));
  if (!isValidPhone(form.phone)) missing.push(t('ProfileCard.form.phone'));
  if (hasEmergencyContact.value && !isValidPhone(form.emergencyContact)) {
    missing.push(t('ProfileCard.form.emergencyContact'));
  }
  return missing;
});

const isValid = computed(() => missingRequired.value.length === 0);

function normalizeUsername(value: string): string {
  return formText(value).trim().replace(/^@/, '');
}

const onSubmit = () => {
  if (props.submitting || !props.employee) return;
  submitted.value = true;
  if (!isValid.value) return;

  emit('save', {
    name: form.name.trim(),
    phone: form.phone.trim(),
    username: normalizeUsername(form.username),
    gender: form.gender,
    languages: form.languages.trim(),
    emergencyContact: hasEmergencyContact.value ? form.emergencyContact.trim() : '',
    nif: form.nif.trim(),
    address: form.address.trim(),
  });
};

const fieldError = (value: string, min = 1) => submitted.value && value.trim().length < min;
</script>

<template>
  <div class="flex h-full flex-col bg-[#f7f7f8]">
    <header class="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ t('ProfileCard.form.title') }}</h2>
          <p class="mt-0.5 text-sm text-gray-400">{{ t('ProfileCard.form.subtitle') }}</p>
        </div>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          :aria-label="t('ProfileCard.form.close')"
          @click="emit('close')"
        >
          <Icon icon="carbon:close" class="size-5" />
        </button>
      </div>
    </header>

    <div
      v-if="loadFailed && !employee"
      class="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center"
    >
      <p class="text-sm text-gray-600">{{ t('ProfileCard.form.loadError') }}</p>
      <button
        type="button"
        class="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f]"
        @click="emit('retry')"
      >
        {{ t('ProfileCard.form.retry') }}
      </button>
    </div>

    <div
      v-else-if="!employee"
      class="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-sm text-gray-500"
    >
      <Icon icon="carbon:circle-dash" class="size-6 animate-spin text-[#e69138]" />
      {{ t('ProfileCard.form.loading') }}
    </div>

    <form v-else class="flex min-h-0 flex-1 flex-col" @submit.prevent="onSubmit">
      <div class="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            {{ t('ProfileCard.form.sectionMain') }}
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="own-name" class="text-xs text-gray-400">
                {{ t('ProfileCard.form.nameRequired') }}
              </label>
              <input
                id="own-name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                :placeholder="t('ProfileCard.form.namePlaceholder')"
                class="form-input"
                :class="{ 'form-input-error': fieldError(form.name, 2) }"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="own-email" class="text-xs text-gray-400">
                {{ t('ProfileCard.form.email') }}
              </label>
              <input
                id="own-email"
                :value="form.email"
                type="email"
                disabled
                autocomplete="email"
                class="form-input cursor-not-allowed bg-gray-100 text-gray-500"
              />
              <p class="text-xs text-gray-400">{{ t('ProfileCard.form.emailHint') }}</p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="own-phone" class="text-xs text-gray-400">
                {{ t('ProfileCard.form.phoneRequired') }}
              </label>
              <PhoneInput
                id="own-phone"
                v-model="form.phone"
                :placeholder="t('ProfileCard.form.phonePlaceholder')"
                :invalid="submitted && !isValidPhone(form.phone)"
              />
            </div>

            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="own-username" class="text-xs text-gray-400">
                {{ t('ProfileCard.form.username') }}
              </label>
              <input
                id="own-username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                :placeholder="t('ProfileCard.form.usernamePlaceholder')"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            {{ t('ProfileCard.form.sectionPersonal') }}
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">{{ t('ProfileCard.form.gender') }}</span>
              <SelectFilter
                v-model="form.gender"
                :options="genderOptions"
                variant="field"
                placement="left"
                :placeholder="t('ProfileCard.form.genderPlaceholder')"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="own-languages" class="text-xs text-gray-400">
                {{ t('ProfileCard.form.languages') }}
              </label>
              <input
                id="own-languages"
                v-model="form.languages"
                type="text"
                :placeholder="t('ProfileCard.form.languagesPlaceholder')"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="own-emergency" class="text-xs text-gray-400">
                {{ t('ProfileCard.form.emergencyContact') }}
              </label>
              <PhoneInput
                id="own-emergency"
                v-model="form.emergencyContact"
                :placeholder="t('ProfileCard.form.phonePlaceholder')"
                :invalid="submitted && hasEmergencyContact && !isValidPhone(form.emergencyContact)"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="own-nif" class="text-xs text-gray-400">
                {{ t('ProfileCard.form.nif') }}
              </label>
              <input
                id="own-nif"
                v-model="form.nif"
                type="text"
                inputmode="numeric"
                :placeholder="t('ProfileCard.form.nifPlaceholder')"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="own-address" class="text-xs text-gray-400">
                {{ t('ProfileCard.form.address') }}
              </label>
              <input
                id="own-address"
                v-model="form.address"
                type="text"
                autocomplete="street-address"
                :placeholder="t('ProfileCard.form.addressPlaceholder')"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <p v-if="submitted && missingRequired.length" class="text-sm text-red-500">
          {{ t('ProfileCard.form.missingFields', { fields: missingRequired.join(', ') }) }}
        </p>
      </div>

      <footer class="flex shrink-0 justify-end gap-2 border-t border-gray-100 bg-white px-5 py-4">
        <button
          type="button"
          class="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          @click="emit('close')"
        >
          {{ t('ProfileCard.form.cancel') }}
        </button>
        <button
          type="submit"
          class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="submitting"
          :aria-busy="submitting"
        >
          <Icon v-if="submitting" icon="carbon:circle-dash" class="size-4 animate-spin" />
          {{ t('ProfileCard.form.save') }}
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
