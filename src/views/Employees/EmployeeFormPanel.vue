<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import PhoneInput from '../../components/PhoneInput/PhoneInput.vue';
import PasswordInput from '../../components/PasswordInput/PasswordInput.vue';
import SelectFilter from '../../components/SelectFilter/SelectFilter.vue';
import type { Employee, EmployeeStatus } from '../../types/employee';
import { EMPLOYEE_ROLE_OPTIONS } from '../../constants/employee-role';
import type { SelectFilterOption } from '../../types/select-filter';
import { hasPhoneNumber, isValidPhone } from '../../domain/phone-value';

interface EmployeeFormPanelProps {
  employee?: Employee.ListItem;
  submitting?: boolean;
}

const props = defineProps<EmployeeFormPanelProps>();

const emit = defineEmits<{
  close: [];
  create: [payload: Employee.CreateCommand];
  update: [payload: Employee.UpdateCommand];
}>();

const { t } = useI18n();

const isEditMode = computed(() => Boolean(props.employee));

const permissionOptions = EMPLOYEE_ROLE_OPTIONS;

const statusOptions = computed<SelectFilterOption[]>(() => [
  { id: 'ACTIVE', label: t('Employees.form.statusActive'), value: 'ACTIVE' },
  { id: 'VACATION', label: t('Employees.form.statusVacation'), value: 'VACATION' },
  { id: 'INACTIVE', label: t('Employees.form.statusInactive'), value: 'INACTIVE' },
]);

const genderOptions = computed<SelectFilterOption[]>(() => [
  { id: 'feminino', label: t('Employees.form.genderFemale'), value: 'Feminino' },
  { id: 'masculino', label: t('Employees.form.genderMale'), value: 'Masculino' },
  { id: 'outro', label: t('Employees.form.genderOther'), value: 'Outro' },
  { id: 'nao-informado', label: t('Employees.form.genderUnspecified'), value: 'Não informado' },
]);

const form = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  nif: '',
  role: 'ADMIN',
  status: 'ACTIVE' as EmployeeStatus,
  gender: 'Não informado',
  address: '',
  languages: 'Português',
  employmentId: '',
  emergencyContact: '',
  jobTitle: '',
  password: '',
  passwordConfirmation: '',
});

const submitted = ref(false);

const fillForm = (employee: Employee.ListItem) => {
  form.name = employee.name;
  form.username = employee.username;
  form.email = employee.email;
  form.phone = employee.phone ?? '';
  form.nif = employee.nif ?? '';
  form.role = employee.role;
  form.status = employee.status;
  form.gender = employee.gender ?? 'Não informado';
  form.address = employee.address ?? '';
  form.languages = employee.languages ?? 'Português';
  form.employmentId = employee.employmentId ?? '';
  form.emergencyContact = employee.emergencyContact ?? '';
  form.jobTitle = employee.jobTitle ?? '';
  submitted.value = false;
};

watch(
  () => props.employee,
  (employee) => {
    if (employee) fillForm(employee);
  },
  { immediate: true },
);

const passwordsMatch = computed(
  () => form.password.trim() === form.passwordConfirmation.trim(),
);

const passwordFilled = computed(
  () => Boolean(form.password.trim() || form.passwordConfirmation.trim()),
);

const hasEmergencyContact = computed(() => hasPhoneNumber(form.emergencyContact));

const emergencyPhoneInvalid = computed(
  () => submitted.value && hasEmergencyContact.value && !isValidPhone(form.emergencyContact),
);

const passwordOk = computed(() =>
  isEditMode.value
    ? !passwordFilled.value || (passwordsMatch.value && form.password.trim().length >= 6)
    : form.password.trim().length >= 6 && passwordsMatch.value,
);

const missingRequired = computed(() => {
  const missing: string[] = [];
  if (form.name.trim().length <= 1) missing.push(t('Employees.form.name'));
  if (!form.email.trim().includes('@')) missing.push(t('Employees.form.email'));
  if (!isValidPhone(form.phone)) missing.push(t('Employees.form.phone'));
  if (form.role.trim().length === 0) missing.push(t('Employees.form.permission'));
  if (hasEmergencyContact.value && !isValidPhone(form.emergencyContact)) {
    missing.push(t('Employees.form.emergencyContact'));
  }
  if (!passwordOk.value) {
    missing.push(
      isEditMode.value
        ? t('Employees.form.password')
        : t('Employees.form.passwordAndConfirm'),
    );
  }
  return missing;
});

const isValid = computed(() => missingRequired.value.length === 0);

const title = computed(() =>
  isEditMode.value ? t('Employees.form.editTitle') : t('Employees.form.createTitle'),
);

const subtitle = computed(() =>
  isEditMode.value
    ? t('Employees.form.editSubtitle')
    : t('Employees.form.createSubtitle'),
);

const submitLabel = computed(() =>
  isEditMode.value ? t('Employees.form.editSubmit') : t('Employees.form.createSubmit'),
);

const onSubmit = () => {
  if (props.submitting) return;
  submitted.value = true;
  if (!isValid.value) return;

  const fields: Employee.UpdateCommand = {
    name: form.name.trim(),
    username: form.username.trim().replace(/^@/, ''),
    email: form.email.trim(),
    phone: form.phone.trim(),
    nif: form.nif.trim(),
    role: form.role,
    status: form.status,
    gender: form.gender,
    address: form.address.trim(),
    languages: form.languages.trim() || 'Português',
    employmentId: form.employmentId.trim(),
    emergencyContact: hasEmergencyContact.value ? form.emergencyContact.trim() : '',
    jobTitle: form.jobTitle.trim(),
  };

  if (isEditMode.value) {
    emit('update', fields);
    return;
  }

  emit('create', {
    ...fields,
    password: form.password.trim(),
    passwordConfirmation: form.passwordConfirmation.trim(),
  });
};

const fieldError = (value: string, min = 1) =>
  submitted.value && value.trim().length < min;
</script>

<template>
  <div class="flex h-full flex-col bg-[#f7f7f8]">
    <header class="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
          <p class="mt-0.5 text-sm text-gray-400">{{ subtitle }}</p>
        </div>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          :aria-label="t('Employees.actions.close')"
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
            {{ t('Employees.form.sectionMain') }}
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="create-name" class="text-xs text-gray-400">
                {{ t('Employees.form.nameRequired') }}
              </label>
              <input
                id="create-name"
                v-model="form.name"
                type="text"
                :placeholder="t('Employees.form.namePlaceholder')"
                class="form-input"
                :class="{ 'form-input-error': fieldError(form.name, 2) }"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-email" class="text-xs text-gray-400">
                {{ t('Employees.form.emailRequired') }}
              </label>
              <input
                id="create-email"
                v-model="form.email"
                type="email"
                :placeholder="t('Employees.form.emailPlaceholder')"
                class="form-input"
                :class="{ 'form-input-error': submitted && !form.email.includes('@') }"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-phone" class="text-xs text-gray-400">
                {{ t('Employees.form.phoneRequired') }}
              </label>
              <PhoneInput
                id="create-phone"
                v-model="form.phone"
                :placeholder="t('Employees.form.phonePlaceholder')"
                :invalid="submitted && !isValidPhone(form.phone)"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-username" class="text-xs text-gray-400">
                {{ t('Employees.form.username') }}
              </label>
              <input
                id="create-username"
                v-model="form.username"
                type="text"
                :placeholder="t('Employees.form.usernamePlaceholder')"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            {{ t('Employees.form.sectionPersonal') }}
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">{{ t('Employees.form.gender') }}</span>
              <SelectFilter
                v-model="form.gender"
                :options="genderOptions"
                variant="field"
                placement="left"
                :placeholder="t('Employees.form.genderPlaceholder')"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-languages" class="text-xs text-gray-400">
                {{ t('Employees.form.languages') }}
              </label>
              <input
                id="create-languages"
                v-model="form.languages"
                type="text"
                :placeholder="t('Employees.form.languagesPlaceholder')"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-emergency" class="text-xs text-gray-400">
                {{ t('Employees.form.emergencyContact') }}
              </label>
              <PhoneInput
                id="create-emergency"
                v-model="form.emergencyContact"
                :placeholder="t('Employees.form.phonePlaceholder')"
                :invalid="emergencyPhoneInvalid"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-nif" class="text-xs text-gray-400">
                {{ t('Employees.form.nif') }}
              </label>
              <input
                id="create-nif"
                v-model="form.nif"
                type="text"
                :placeholder="t('Employees.form.nifPlaceholder')"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="create-address" class="text-xs text-gray-400">
                {{ t('Employees.form.address') }}
              </label>
              <input
                id="create-address"
                v-model="form.address"
                type="text"
                :placeholder="t('Employees.form.addressPlaceholder')"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            {{ t('Employees.form.sectionProfessional') }}
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="create-job" class="text-xs text-gray-400">
                {{ t('Employees.form.jobTitle') }}
              </label>
              <input
                id="create-job"
                v-model="form.jobTitle"
                type="text"
                :placeholder="t('Employees.form.jobTitlePlaceholder')"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">
                {{ t('Employees.form.permissionRequired') }}
              </span>
              <SelectFilter
                v-model="form.role"
                :options="permissionOptions"
                variant="field"
                placement="top"
                :placeholder="t('Employees.form.permissionPlaceholder')"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">{{ t('Employees.form.status') }}</span>
              <SelectFilter
                v-model="form.status"
                :options="statusOptions"
                variant="field"
                placement="top"
                :placeholder="t('Employees.form.statusPlaceholder')"
                :disabled="!isEditMode"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-matricula" class="text-xs text-gray-400">
                {{ t('Employees.form.employmentId') }}
              </label>
              <input
                id="create-matricula"
                v-model="form.employmentId"
                type="text"
                :placeholder="t('Employees.form.employmentIdPlaceholder')"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            {{ t('Employees.form.sectionAccess') }}
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="create-password" class="text-xs text-gray-400">
                {{ isEditMode ? t('Employees.form.password') : t('Employees.form.passwordRequired') }}
              </label>
              <PasswordInput
                id="create-password"
                v-model="form.password"
                variant="field"
                autocomplete="new-password"
                :placeholder="t('Employees.form.passwordPlaceholder')"
                :show-label="t('Employees.form.showPassword')"
                :hide-label="t('Employees.form.hidePassword')"
                :invalid="
                  submitted &&
                  (!isEditMode
                    ? form.password.trim().length < 6
                    : passwordFilled && form.password.trim().length < 6)
                "
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-confirm-password" class="text-xs text-gray-400">
                {{
                  isEditMode
                    ? t('Employees.form.confirmPassword')
                    : t('Employees.form.confirmPasswordRequired')
                }}
              </label>
              <PasswordInput
                id="create-confirm-password"
                v-model="form.passwordConfirmation"
                variant="field"
                autocomplete="new-password"
                :placeholder="t('Employees.form.passwordPlaceholder')"
                :show-label="t('Employees.form.showPassword')"
                :hide-label="t('Employees.form.hidePassword')"
                :invalid="
                  submitted &&
                  (!isEditMode
                    ? !passwordsMatch || form.passwordConfirmation.trim().length < 6
                    : passwordFilled && !passwordsMatch)
                "
              />
            </div>
          </div>
        </section>

        <p v-if="submitted && missingRequired.length" class="text-sm text-red-500">
          {{ t('Employees.form.missingFields', { fields: missingRequired.join(', ') }) }}
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
          {{ t('Employees.actions.cancel') }}
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
          {{ submitLabel }}
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
