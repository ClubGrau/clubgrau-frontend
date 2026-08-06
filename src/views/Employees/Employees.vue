<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';

type EmployeeStatus = 'ativo' | 'ferias' | 'inativo';
type StatusFilter = 'todos' | EmployeeStatus;

interface Employee {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  nif: string;
  permission: string;
  status: EmployeeStatus;
  initials: string;
}

const employees: Employee[] = [
  {
    id: 1,
    name: 'Lucas Ferreira',
    username: 'lucasferreira',
    email: 'lucasferreia@gmail.com',
    phone: '+351 233-906-250',
    nif: '271216182',
    permission: 'Manager',
    status: 'ativo',
    initials: 'LF',
  },
  {
    id: 2,
    name: 'Ana Sofia Mendes',
    username: 'anasmendes',
    email: 'ana.mendes@grausystem.pt',
    phone: '+351 912-445-780',
    nif: '234567891',
    permission: 'Operador',
    status: 'ativo',
    initials: 'AM',
  },
  {
    id: 3,
    name: 'Pedro Costa',
    username: 'pedrocosta',
    email: 'pedro.costa@grausystem.pt',
    phone: '+351 933-120-445',
    nif: '198765432',
    permission: 'Admin',
    status: 'ativo',
    initials: 'PC',
  },
  {
    id: 4,
    name: 'Mariana Lopes',
    username: 'marianaslopes',
    email: 'mariana.lopes@grausystem.pt',
    phone: '+351 967-881-203',
    nif: '256789123',
    permission: 'Manager',
    status: 'ferias',
    initials: 'ML',
  },
  {
    id: 5,
    name: 'João Ribeiro',
    username: 'joaoribeiro',
    email: 'joao.ribeiro@grausystem.pt',
    phone: '+351 924-556-019',
    nif: '212345678',
    permission: 'Operador',
    status: 'ativo',
    initials: 'JR',
  },
  {
    id: 6,
    name: 'Beatriz Nunes',
    username: 'beatriznunes',
    email: 'beatriz.nunes@grausystem.pt',
    phone: '+351 918-334-672',
    nif: '267891234',
    permission: 'Financeiro',
    status: 'ativo',
    initials: 'BN',
  },
  {
    id: 7,
    name: 'Ricardo Almeida',
    username: 'ricardoalmeida',
    email: 'ricardo.almeida@grausystem.pt',
    phone: '+351 961-772-408',
    nif: '245678912',
    permission: 'Manager',
    status: 'ativo',
    initials: 'RA',
  },
  {
    id: 8,
    name: 'Carla Teixeira',
    username: 'carlateixeira',
    email: 'carla.teixeira@grausystem.pt',
    phone: '+351 935-209-881',
    nif: '223456789',
    permission: 'Operador',
    status: 'inativo',
    initials: 'CT',
  },
  {
    id: 9,
    name: 'Tiago Martins',
    username: 'tiagomartins',
    email: 'tiago.martins@grausystem.pt',
    phone: '+351 929-640-115',
    nif: '278901234',
    permission: 'Admin',
    status: 'ativo',
    initials: 'TM',
  },
  {
    id: 10,
    name: 'Sofia Carvalho',
    username: 'sofiacarvalho',
    email: 'sofia.carvalho@grausystem.pt',
    phone: '+351 914-883-560',
    nif: '289012345',
    permission: 'Financeiro',
    status: 'ativo',
    initials: 'SC',
  },
  {
    id: 11,
    name: 'Miguel Santos',
    username: 'miguelsantos',
    email: 'miguel.santos@grausystem.pt',
    phone: '+351 912-778-341',
    nif: '201234567',
    permission: 'Operador',
    status: 'ativo',
    initials: 'MS',
  },
  {
    id: 12,
    name: 'Inês Oliveira',
    username: 'inesoliveira',
    email: 'ines.oliveira@grausystem.pt',
    phone: '+351 936-552-890',
    nif: '212987654',
    permission: 'Manager',
    status: 'ativo',
    initials: 'IO',
  },
  {
    id: 13,
    name: 'André Pereira',
    username: 'andrepereira',
    email: 'andre.pereira@grausystem.pt',
    phone: '+351 968-441-203',
    nif: '223876541',
    permission: 'Admin',
    status: 'ferias',
    initials: 'AP',
  },
  {
    id: 14,
    name: 'Catarina Sousa',
    username: 'catarinasousa',
    email: 'catarina.sousa@grausystem.pt',
    phone: '+351 925-119-674',
    nif: '234765432',
    permission: 'Financeiro',
    status: 'ativo',
    initials: 'CS',
  },
  {
    id: 15,
    name: 'Bruno Fernandes',
    username: 'brunofernandes',
    email: 'bruno.fernandes@grausystem.pt',
    phone: '+351 917-883-025',
    nif: '245654321',
    permission: 'Operador',
    status: 'ativo',
    initials: 'BF',
  },
  {
    id: 16,
    name: 'Diana Rocha',
    username: 'dianarocha',
    email: 'diana.rocha@grausystem.pt',
    phone: '+351 934-667-812',
    nif: '256543210',
    permission: 'Manager',
    status: 'inativo',
    initials: 'DR',
  },
  {
    id: 17,
    name: 'Gonçalo Pinto',
    username: 'goncalopinto',
    email: 'goncalo.pinto@grausystem.pt',
    phone: '+351 961-334-509',
    nif: '267432109',
    permission: 'Operador',
    status: 'ativo',
    initials: 'GP',
  },
  {
    id: 18,
    name: 'Helena Dias',
    username: 'helenadias',
    email: 'helena.dias@grausystem.pt',
    phone: '+351 929-220-746',
    nif: '278321098',
    permission: 'Financeiro',
    status: 'ativo',
    initials: 'HD',
  },
  {
    id: 19,
    name: 'Fábio Correia',
    username: 'fabiocorreia',
    email: 'fabio.correia@grausystem.pt',
    phone: '+351 913-998-157',
    nif: '289210987',
    permission: 'Admin',
    status: 'ativo',
    initials: 'FC',
  },
  {
    id: 20,
    name: 'Laura Gomes',
    username: 'lauragomes',
    email: 'laura.gomes@grausystem.pt',
    phone: '+351 947-665-430',
    nif: '290109876',
    permission: 'Manager',
    status: 'ativo',
    initials: 'LG',
  },
];

const statusFilter = ref<StatusFilter>('todos');
const searchQuery = ref('');
const permissionFilter = ref('');
const selectedIds = ref<number[]>([]);
const pageSize = ref(10);
const currentPage = ref(1);

const permissions = computed(() =>
  [...new Set(employees.map((employee) => employee.permission))],
);

const stats = computed(() => {
  const total = employees.length;
  const ativos = employees.filter((e) => e.status === 'ativo').length;
  const ferias = employees.filter((e) => e.status === 'ferias').length;
  const inativos = employees.filter((e) => e.status === 'inativo').length;

  return { total, ativos, ferias, inativos };
});

const filteredEmployees = computed(() => {
  return employees.filter((employee) => {
    const matchesStatus =
      statusFilter.value === 'todos' || employee.status === statusFilter.value;

    const query = searchQuery.value.trim().toLowerCase();
    const matchesSearch =
      !query ||
      employee.name.toLowerCase().includes(query) ||
      employee.username.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.phone.toLowerCase().includes(query) ||
      employee.nif.includes(query);

    const matchesPermission =
      !permissionFilter.value || employee.permission === permissionFilter.value;

    return matchesStatus && matchesSearch && matchesPermission;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredEmployees.value.length / pageSize.value)),
);

const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredEmployees.value.slice(start, start + pageSize.value);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | 'ellipsis')[] = [1, 2, 3, 4];
  if (total > 5) {
    pages.push('ellipsis', total);
  }
  return pages;
});

const tabs: { label: string; value: StatusFilter }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Ativos', value: 'ativo' },
  { label: 'Férias', value: 'ferias' },
  { label: 'Inativos', value: 'inativo' },
];

const statusLabel: Record<EmployeeStatus, string> = {
  ativo: 'Ativo',
  ferias: 'Férias',
  inativo: 'Inativo',
};

const statusClasses: Record<EmployeeStatus, string> = {
  ativo: 'bg-[#e8f8ef] text-[#1f9d55]',
  ferias: 'bg-[#fff4e5] text-[#c47a12]',
  inativo: 'bg-[#fde8e8] text-[#d64545]',
};

const isSelected = (id: number) => selectedIds.value.includes(id);

const toggleSelect = (id: number) => {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id);
    return;
  }
  selectedIds.value = [...selectedIds.value, id];
};

const setStatusFilter = (value: StatusFilter) => {
  statusFilter.value = value;
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
</script>

<template>
  <div class="min-h-full bg-[#f5f5f7] px-8 pb-8 pt-5">
    <nav class="mb-4 text-sm text-gray-400">
      <span>Dashboard</span>
      <span class="mx-1.5">&gt;</span>
      <span class="text-gray-600">Colaboradores</span>
    </nav>

    <!-- Title + CTA -->
    <div class="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Colaboradores</h1>
        <p class="mt-1 text-sm text-gray-400">
          {{ stats.total }} pessoas cadastradas · {{ stats.ativos }} ativas ·
          {{ stats.ferias }} em férias
        </p>
      </div>

      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f]"
      >
        Novo colaborador
        <span class="text-lg leading-none">+</span>
      </button>
    </div>

    <!-- Stats -->
    <div class="mb-6 grid grid-cols-4 gap-4">
      <div class="rounded-xl bg-[#ececf0] px-5 py-4">
        <p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          Total da equipe
        </p>
        <p class="mt-1 text-3xl font-bold text-gray-900">{{ stats.total }}</p>
        <p class="mt-1 text-xs text-gray-400">Cadastrados ativos no sistema</p>
      </div>

      <div class="rounded-xl bg-[#ececf0] px-5 py-4">
        <p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          Em atividade
        </p>
        <p class="mt-1 text-3xl font-bold text-gray-900">{{ stats.ativos }}</p>
        <p class="mt-1 text-xs text-gray-400">Disponível para alocação</p>
      </div>

      <div class="rounded-xl bg-[#ececf0] px-5 py-4">
        <p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          Em férias
        </p>
        <p class="mt-1 text-3xl font-bold text-gray-900">{{ stats.ferias }}</p>
        <p class="mt-1 text-xs text-gray-400">Cadastrados ativos no sistema</p>
      </div>

      <div class="rounded-xl bg-[#f8eaea] px-5 py-4">
        <p class="text-[11px] font-semibold tracking-wide text-[#d64545] uppercase">
          Inativos
        </p>
        <p class="mt-1 text-3xl font-bold text-[#d64545]">{{ stats.inativos }}</p>
        <p class="mt-1 text-xs text-[#d64545]">Sem acesso ao sistema</p>
      </div>
    </div>

    <!-- Table card -->
    <section class="rounded-2xl bg-white p-5 shadow-sm">
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-1 rounded-full bg-[#f3f3f5] p-1">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors"
            :class="
              statusFilter === tab.value
                ? 'bg-[#5c5c66] font-medium text-white'
                : 'text-gray-500 hover:text-gray-700'
            "
            @click="setStatusFilter(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="relative min-w-[280px] flex-1">
          <Icon
            icon="carbon:search"
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Busque por Nome, Contatos..."
            class="w-full rounded-full border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-300"
            @input="currentPage = 1"
          />
        </div>

        <div class="relative">
          <select
            v-model="permissionFilter"
            class="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white py-2.5 pr-9 pl-4 text-sm text-gray-500 outline-none focus:border-gray-300"
            @change="currentPage = 1"
          >
            <option value="">Filtrar por permissão</option>
            <option v-for="permission in permissions" :key="permission" :value="permission">
              {{ permission }}
            </option>
          </select>
          <Icon
            icon="carbon:chevron-down"
            class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr class="border-b border-gray-100 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
              <th class="w-10 py-3 pr-2 font-semibold"></th>
              <th class="py-3 pr-4 font-semibold">Nome do colaborador</th>
              <th class="py-3 pr-4 font-semibold">Contatos</th>
              <th class="py-3 pr-4 font-semibold">Nif</th>
              <th class="py-3 pr-4 font-semibold">Permissão</th>
              <th class="py-3 pr-4 font-semibold">Status</th>
              <th class="py-3 pl-2 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="employee in paginatedEmployees"
              :key="employee.id"
              class="border-b border-gray-50 last:border-b-0"
            >
              <td class="py-4 pr-2 align-middle">
                <button
                  type="button"
                  class="flex size-4 cursor-pointer items-center justify-center rounded-full border transition-colors"
                  :class="
                    isSelected(employee.id)
                      ? 'border-[#2f6f73] bg-[#2f6f73]'
                      : 'border-[#2f6f73] bg-transparent'
                  "
                  @click="toggleSelect(employee.id)"
                >
                  <span
                    v-if="isSelected(employee.id)"
                    class="size-1.5 rounded-full bg-white"
                  />
                </button>
              </td>

              <td class="py-4 pr-4 align-middle">
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1a2332] text-xs font-semibold text-white"
                  >
                    {{ employee.initials }}
                  </div>
                  <div class="min-w-0 leading-tight">
                    <p class="truncate text-sm font-semibold text-gray-900">
                      {{ employee.name }}
                    </p>
                    <p class="truncate text-xs text-gray-400">@{{ employee.username }}</p>
                  </div>
                </div>
              </td>

              <td class="py-4 pr-4 align-middle">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <Icon icon="carbon:email" class="size-3.5 shrink-0 text-gray-400" />
                    <span class="truncate">{{ employee.email }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <Icon icon="carbon:phone" class="size-3.5 shrink-0 text-gray-400" />
                    <span>{{ employee.phone }}</span>
                  </div>
                </div>
              </td>

              <td class="py-4 pr-4 align-middle text-sm text-gray-700">
                {{ employee.nif }}
              </td>

              <td class="py-4 pr-4 align-middle text-sm text-gray-700">
                {{ employee.permission }}
              </td>

              <td class="py-4 pr-4 align-middle">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  :class="statusClasses[employee.status]"
                >
                  {{ statusLabel[employee.status] }}
                </span>
              </td>

              <td class="py-4 pl-2 text-right align-middle">
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <Icon icon="carbon:overflow-menu-vertical" class="size-5" />
                </button>
              </td>
            </tr>

            <tr v-if="paginatedEmployees.length === 0">
              <td colspan="7" class="py-12 text-center text-sm text-gray-400">
                Nenhum colaborador encontrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>Exibindo</span>
          <div class="relative">
            <select
              v-model.number="pageSize"
              class="cursor-pointer appearance-none rounded-md border border-gray-200 bg-white py-1 pr-7 pl-2.5 text-sm text-gray-700 outline-none"
              @change="currentPage = 1"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
            </select>
            <Icon
              icon="carbon:chevron-down"
              class="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-gray-400"
            />
          </div>
          <span>de {{ filteredEmployees.length }} resultados</span>
        </div>

        <div class="flex items-center gap-1 text-sm">
          <button
            type="button"
            class="cursor-pointer px-2 py-1 text-gray-500 transition-colors hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            Anterior
          </button>

          <template v-for="(page, index) in pageNumbers" :key="`${page}-${index}`">
            <span v-if="page === 'ellipsis'" class="px-1 text-gray-400">...</span>
            <button
              v-else
              type="button"
              class="min-w-7 cursor-pointer rounded-md px-2 py-1 transition-colors"
              :class="
                currentPage === page
                  ? 'bg-gray-100 font-semibold text-gray-900'
                  : 'text-gray-500 hover:text-gray-800'
              "
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </template>

          <button
            type="button"
            class="cursor-pointer px-2 py-1 text-gray-500 transition-colors hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Próximo
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
