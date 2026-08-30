<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import PhoneInput from '../../components/PhoneInput/PhoneInput.vue';
import PasswordInput from '../../components/PasswordInput/PasswordInput.vue';
import SelectFilter from '../../components/SelectFilter/SelectFilter.vue';
import type {
  EmployeeCreatePayload,
  EmployeeShapped,
  EmployeeStatus,
} from '../../types/employee';
import { EMPLOYEE_ROLE_OPTIONS } from '../../constants/employee-role';
import type { SelectFilterOption } from '../../types/select-filter';
import { hasPhoneNumber, isValidPhone } from '../../domain/phone-value';

const props = defineProps<{
  employee?: EmployeeShapped;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: EmployeeCreatePayload];
}>();

const isEditMode = computed(() => Boolean(props.employee));

const permissionOptions = EMPLOYEE_ROLE_OPTIONS;

const statusOptions: SelectFilterOption[] = [
  { id: 'ACTIVE', label: 'Ativo', value: 'ACTIVE' },
  { id: 'VACATION', label: 'Férias', value: 'VACATION' },
  { id: 'INACTIVE', label: 'Inativo', value: 'INACTIVE' },
];

const genderOptions: SelectFilterOption[] = [
  { id: 'feminino', label: 'Feminino', value: 'Feminino' },
  { id: 'masculino', label: 'Masculino', value: 'Masculino' },
  { id: 'outro', label: 'Outro', value: 'Outro' },
  { id: 'nao-informado', label: 'Não informado', value: 'Não informado' },
];

const form = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  nif: '',
  permission: 'EMPLOYEE',
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

const fillForm = (employee: EmployeeShapped) => {
  form.name = employee.name;
  form.username = employee.username;
  form.email = employee.email;
  form.phone = employee.phone;
  form.nif = employee.nif;
  form.permission = employee.permission;
  form.status = employee.status;
  form.gender = employee.gender;
  form.address = employee.address;
  form.languages = employee.languages;
  form.employmentId = employee.employmentId;
  form.emergencyContact = employee.emergencyContact ?? '';
  form.jobTitle = employee.jobTitle;
  form.password = employee.password;
  form.passwordConfirmation = employee.passwordConfirmation;
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
  if (form.name.trim().length <= 1) missing.push('Nome completo');
  if (!form.email.trim().includes('@')) missing.push('E-mail');
  if (!isValidPhone(form.phone)) missing.push('Telefone');
  if (form.permission.trim().length === 0) missing.push('Permissão');
  if (hasEmergencyContact.value && !isValidPhone(form.emergencyContact)) {
    missing.push('Contato de emergência');
  }
  if (!passwordOk.value) missing.push(isEditMode.value ? 'Senha' : 'Senha e confirmação');
  return missing;
});

const isValid = computed(() => missingRequired.value.length === 0);

const title = computed(() =>
  isEditMode.value ? 'Editar colaborador' : 'Novo colaborador',
);

const subtitle = computed(() =>
  isEditMode.value
    ? 'Atualize os dados do membro da equipe'
    : 'Preencha os dados para cadastrar um novo membro da equipe',
);

const submitLabel = computed(() =>
  isEditMode.value ? 'Salvar alterações' : 'Criar colaborador',
);

const onSubmit = () => {
  if (props.submitting) return;
  submitted.value = true;
  if (!isValid.value) return;

  const payload: EmployeeCreatePayload = {
    name: form.name.trim(),
    username: form.username.trim().replace(/^@/, ''),
    email: form.email.trim(),
    phone: form.phone.trim(),
    nif: form.nif.trim(),
    permission: form.permission,
    status: form.status,
    gender: form.gender,
    address: form.address.trim(),
    languages: form.languages.trim() || 'Português',
    employmentId: form.employmentId.trim(),
    emergencyContact: hasEmergencyContact.value ? form.emergencyContact.trim() : '',
    jobTitle: form.jobTitle.trim(),
    password: form.password.trim(),
   passwordConfirmation: form.passwordConfirmation.trim(),
  };

  emit('submit', payload);
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
          aria-label="Fechar"
          @click="emit('close')"
        >
          <Icon icon="carbon:close" class="size-5" />
        </button>
      </div>
    </header>

    <form class="flex min-h-0 flex-1 flex-col" @submit.prevent="onSubmit">
      <div class="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">Dados principais</h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="create-name" class="text-xs text-gray-400">Nome completo *</label>
              <input
                id="create-name"
                v-model="form.name"
                type="text"
                placeholder="Ex: Cameron Williamson"
                class="form-input"
                :class="{ 'form-input-error': fieldError(form.name, 2) }"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-email" class="text-xs text-gray-400">E-mail *</label>
              <input
                id="create-email"
                v-model="form.email"
                type="email"
                placeholder="nome@empresa.pt"
                class="form-input"
                :class="{ 'form-input-error': submitted && !form.email.includes('@') }"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-phone" class="text-xs text-gray-400">Telefone *</label>
              <PhoneInput
                id="create-phone"
                v-model="form.phone"
                placeholder="912 345 678"
                :invalid="submitted && !isValidPhone(form.phone)"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-username" class="text-xs text-gray-400">Username</label>
              <input
                id="create-username"
                v-model="form.username"
                type="text"
                placeholder="ex: cameronw"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">Informações pessoais</h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">Gênero</span>
              <SelectFilter
                v-model="form.gender"
                :options="genderOptions"
                variant="field"
                placement="left"
                placeholder="Selecionar gênero"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-languages" class="text-xs text-gray-400">Idiomas</label>
              <input
                id="create-languages"
                v-model="form.languages"
                type="text"
                placeholder="Português, Inglês"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-emergency" class="text-xs text-gray-400">
                Contato de emergência
              </label>
              <PhoneInput
                id="create-emergency"
                v-model="form.emergencyContact"
                placeholder="912 345 678"
                :invalid="emergencyPhoneInvalid"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-nif" class="text-xs text-gray-400">NIF</label>
              <input
                id="create-nif"
                v-model="form.nif"
                type="text"
                placeholder="123456789"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="create-address" class="text-xs text-gray-400">Morada</label>
              <input
                id="create-address"
                v-model="form.address"
                type="text"
                placeholder="Rua, cidade, país"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            Informações profissionais
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="create-job" class="text-xs text-gray-400">Cargo</label>
              <input
                id="create-job"
                v-model="form.jobTitle"
                type="text"
                placeholder="Ex: UI Designer"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">Permissão *</span>
              <SelectFilter
                v-model="form.permission"
                :options="permissionOptions"
                variant="field"
                placement="top"
                placeholder="Selecionar permissão"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">Status</span>
              <SelectFilter
                v-model="form.status"
                :options="statusOptions"
                variant="field"
                placement="top"
                placeholder="Selecionar status"
                :disabled="!isEditMode"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-matricula" class="text-xs text-gray-400">Matrícula</label>
              <input
                id="create-matricula"
                v-model="form.employmentId"
                type="text"
                placeholder="123456789"
                class="form-input"
              />
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            Informações de acesso
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="create-password" class="text-xs text-gray-400">
                Senha{{ isEditMode ? '' : ' *' }}
              </label>
              <PasswordInput
                id="create-password"
                v-model="form.password"
                variant="field"
                autocomplete="new-password"
                placeholder="********"
                show-label="Mostrar senha"
                hide-label="Ocultar senha"
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
                Confirmar senha{{ isEditMode ? '' : ' *' }}
              </label>
              <PasswordInput
                id="create-confirm-password"
                v-model="form.passwordConfirmation"
                variant="field"
                autocomplete="new-password"
                placeholder="********"
                show-label="Mostrar senha"
                hide-label="Ocultar senha"
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
          Preencha os campos obrigatórios: {{ missingRequired.join(', ') }}.
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
          Cancelar
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
