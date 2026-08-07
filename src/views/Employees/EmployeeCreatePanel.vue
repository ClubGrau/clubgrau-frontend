<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Icon } from '@iconify/vue';
import PhoneInput from '../../components/PhoneInput/PhoneInput.vue';
import SelectFilter from '../../components/SelectFilter/SelectFilter.vue';
import type { EmployeeCreatePayload, EmployeeStatus } from '../../types/employee';
import type { SelectFilterOption } from '../../types/select-filter';

const emit = defineEmits<{
  close: [];
  submit: [payload: EmployeeCreatePayload];
}>();

const permissionOptions: SelectFilterOption[] = [
  { id: 'manager', label: 'Manager', value: 'Manager' },
  { id: 'operador', label: 'Operador', value: 'Operador' },
  { id: 'admin', label: 'Admin', value: 'Admin' },
  { id: 'financeiro', label: 'Financeiro', value: 'Financeiro' },
];

const statusOptions: SelectFilterOption[] = [
  { id: 'ativo', label: 'Ativo', value: 'ativo' },
  { id: 'ferias', label: 'Férias', value: 'ferias' },
  { id: 'inativo', label: 'Inativo', value: 'inativo' },
];

const genderOptions: SelectFilterOption[] = [
  { id: 'feminino', label: 'Feminino', value: 'Feminino' },
  { id: 'masculino', label: 'Masculino', value: 'Masculino' },
  { id: 'outro', label: 'Outro', value: 'Outro' },
  { id: 'nao-informado', label: 'Não informado', value: 'Não informado' },
];

const maritalOptions: SelectFilterOption[] = [
  { id: 'solteiro', label: 'Solteiro(a)', value: 'Solteiro(a)' },
  { id: 'casado', label: 'Casado(a)', value: 'Casado(a)' },
  { id: 'divorciado', label: 'Divorciado(a)', value: 'Divorciado(a)' },
  { id: 'viuvo', label: 'Viúvo(a)', value: 'Viúvo(a)' },
];

const employmentTypeOptions: SelectFilterOption[] = [
  { id: 'tempo-integral', label: 'Tempo integral', value: 'Tempo integral' },
  { id: 'meio-periodo', label: 'Meio período', value: 'Meio período' },
  { id: 'temporario', label: 'Temporário', value: 'Temporário' },
  { id: 'estagio', label: 'Estágio', value: 'Estágio' },
];

const form = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  nif: '',
  permission: 'Operador',
  status: 'ativo' as EmployeeStatus,
  department: '',
  dateHired: '',
  gender: 'Não informado',
  maritalStatus: 'Solteiro(a)',
  address: '',
  languages: 'Português',
  education: '',
  emergencyContact: '',
  emergencyContactRelation: 'Familiar',
  employmentType: 'Tempo integral',
  jobTitle: '',
  skillsInput: '',
});

const submitted = ref(false);
const isPhoneValid = ref(false);
const isEmergencyPhoneValid = ref(true);

const skills = computed(() =>
  form.skillsInput
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean),
);

const isValid = computed(() => {
  const emergencyOk =
    !form.emergencyContact.trim() || isEmergencyPhoneValid.value;

  return (
    form.name.trim().length > 1 &&
    form.username.trim().length > 1 &&
    form.email.trim().includes('@') &&
    isPhoneValid.value &&
    form.nif.trim().length >= 5 &&
    form.permission.trim().length > 0 &&
    form.department.trim().length > 0 &&
    form.jobTitle.trim().length > 0 &&
    emergencyOk
  );
});

const onSubmit = () => {
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
    department: form.department.trim(),
    dateHired: form.dateHired || formatToday(),
    gender: form.gender,
    maritalStatus: form.maritalStatus,
    address: form.address.trim() || '—',
    languages: form.languages.trim() || 'Português',
    education: form.education.trim() || '—',
    emergencyContact: form.emergencyContact.trim() || form.phone.trim(),
    emergencyContactRelation: form.emergencyContactRelation.trim() || 'Familiar',
    employmentType: form.employmentType,
    jobTitle: form.jobTitle.trim(),
    skills: skills.value.length ? skills.value : ['Comunicação'],
  };

  emit('submit', payload);
};

const formatToday = () => {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
};

const fieldError = (value: string, min = 1) =>
  submitted.value && value.trim().length < min;

const onPhoneValidate = (valid: boolean) => {
  isPhoneValid.value = valid;
};

const onEmergencyPhoneValidate = (valid: boolean) => {
  isEmergencyPhoneValid.value = !form.emergencyContact.trim() || valid;
};
</script>

<template>
  <div class="flex h-full flex-col bg-[#f7f7f8]">
    <header class="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Novo colaborador</h2>
          <p class="mt-0.5 text-sm text-gray-400">
            Preencha os dados para cadastrar um novo membro da equipe
          </p>
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
              <label for="create-username" class="text-xs text-gray-400">Username *</label>
              <input
                id="create-username"
                v-model="form.username"
                type="text"
                placeholder="ex: cameronw"
                class="form-input"
                :class="{ 'form-input-error': fieldError(form.username, 2) }"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-nif" class="text-xs text-gray-400">NIF *</label>
              <input
                id="create-nif"
                v-model="form.nif"
                type="text"
                placeholder="123456789"
                class="form-input"
                :class="{ 'form-input-error': fieldError(form.nif, 5) }"
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
                placeholder="900 000 000"
                :invalid="submitted && !isPhoneValid"
                @validate="onPhoneValidate"
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
              <span class="text-xs text-gray-400">Estado civil</span>
              <SelectFilter
                v-model="form.maritalStatus"
                :options="maritalOptions"
                variant="field"
                placement="right"
                placeholder="Selecionar estado civil"
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
              <label for="create-education" class="text-xs text-gray-400">Formação</label>
              <input
                id="create-education"
                v-model="form.education"
                type="text"
                placeholder="Licenciatura em..."
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
                placeholder="900 000 000"
                :invalid="
                  submitted &&
                  Boolean(form.emergencyContact.trim()) &&
                  !isEmergencyPhoneValid
                "
                @validate="onEmergencyPhoneValidate"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-emergency-relation" class="text-xs text-gray-400">
                Parentesco
              </label>
              <input
                id="create-emergency-relation"
                v-model="form.emergencyContactRelation"
                type="text"
                placeholder="Pai, Mãe, Cônjuge..."
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
              <label for="create-job" class="text-xs text-gray-400">Cargo *</label>
              <input
                id="create-job"
                v-model="form.jobTitle"
                type="text"
                placeholder="Ex: UI Designer"
                class="form-input"
                :class="{ 'form-input-error': fieldError(form.jobTitle) }"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-department" class="text-xs text-gray-400">Departamento *</label>
              <input
                id="create-department"
                v-model="form.department"
                type="text"
                placeholder="Ex: Design"
                class="form-input"
                :class="{ 'form-input-error': fieldError(form.department) }"
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
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">Tipo de contrato</span>
              <SelectFilter
                v-model="form.employmentType"
                :options="employmentTypeOptions"
                variant="field"
                placement="top"
                placeholder="Selecionar contrato"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="create-hired" class="text-xs text-gray-400">Data de admissão</label>
              <input
                id="create-hired"
                v-model="form.dateHired"
                type="text"
                placeholder="17 Mar 2024"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="create-skills" class="text-xs text-gray-400">
                Competências
              </label>
              <input
                id="create-skills"
                v-model="form.skillsInput"
                type="text"
                placeholder="Separe por vírgula: UI Design, Comunicação..."
                class="form-input"
              />
            </div>
          </div>
        </section>

        <p v-if="submitted && !isValid" class="text-sm text-red-500">
          Preencha os campos obrigatórios marcados com *.
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
          class="cursor-pointer rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f]"
        >
          Criar colaborador
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
