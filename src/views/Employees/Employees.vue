<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import Drawer from '../../components/Drawer/Drawer.vue';
import PageHeader from '../../components/PageHeader/PageHeader.vue';
import StatCard from '../../components/StatCard/StatCard.vue';
import SelectFilter from '../../components/SelectFilter/SelectFilter.vue';
import StatusBadge from '../../components/StatusBadge/StatusBadge.vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import EmployeeFormPanel from './EmployeeFormPanel.vue';
import EmployeeDetailPanel from './EmployeeDetailPanel.vue';
import { employeeStatusBadge } from '../../constants/employee-status';
import { employeesMock } from './employees-mock';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import type { EmployeeDrawerState } from '../../types/drawer';
import type {
  Employee,
  EmployeeCreatePayload,
  EmployeeStatus,
  EmployeeUpdatePayload,
} from '../../types/employee';
import type { SelectFilterOption } from '../../types/select-filter';
import type { StatCardItem } from '../../types/stat-card';

type StatusFilter = 'todos' | EmployeeStatus;

const breadcrumbItems: BreadcrumbItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/app/dashboard' },
  { id: 'employees', label: 'Colaboradores' },
];

const employees = ref<Employee[]>([...employeesMock]);

const statusFilter = ref<StatusFilter>('todos');
const searchQuery = ref('');
const permissionFilter = ref('');
const selectedIds = ref<number[]>([]);
const openActionsId = ref<number | null>(null);
const drawer = ref<EmployeeDrawerState>({ open: false });
const pageSize = ref(10);
const currentPage = ref(1);

const informationSubtitle = computed(() => {
  return `${stats.value.total} pessoas cadastradas · ${stats.value.ativos} ativas · ${stats.value.ferias} em férias`;
});

const permissionOptions = computed<SelectFilterOption[]>(() => [
  { id: 'all', label: 'Filtrar por permissão', value: '' },
  ...[...new Set(employees.value.map((employee) => employee.permission))].map(
    (permission) => ({
      id: permission,
      label: permission,
      value: permission,
    }),
  ),
]);

const pageSizeOptions: SelectFilterOption[] = [
  { id: 5, label: '5', value: 5 },
  { id: 10, label: '10', value: 10 },
  { id: 20, label: '20', value: 20 },
];

const onPermissionFilterChange = () => {
  currentPage.value = 1;
};

const onPageSizeChange = () => {
  currentPage.value = 1;
};

const stats = computed(() => {
  const total = employees.value.length;
  const ativos = employees.value.filter((e) => e.status === 'ativo').length;
  const ferias = employees.value.filter((e) => e.status === 'ferias').length;
  const inativos = employees.value.filter((e) => e.status === 'inativo').length;

  return { total, ativos, ferias, inativos };
});

const statCards = computed<StatCardItem[]>(() => [
  {
    id: 'total',
    label: 'Total da equipe',
    value: stats.value.total,
    description: 'Cadastrados ativos no sistema',
  },
  {
    id: 'active',
    label: 'Em atividade',
    value: stats.value.ativos,
    description: 'Disponível para alocação',
  },
  {
    id: 'vacation',
    label: 'Em férias',
    value: stats.value.ferias,
    description: 'Cadastrados ativos no sistema',
  },
  {
    id: 'inactive',
    label: 'Inativos',
    value: stats.value.inativos,
    description: 'Sem acesso ao sistema',
    variant: 'danger',
  },
]);

const filteredEmployees = computed(() => {
  return employees.value.filter((employee) => {
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

const isCreateDrawerOpen = computed(
  () => drawer.value.open && drawer.value.mode === 'create',
);

const isEditDrawerOpen = computed(
  () => drawer.value.open && drawer.value.mode === 'edit',
);

const activeEmployeeId = computed(() => {
  const state = drawer.value;
  if (!state.open) return null;
  if (state.mode === 'detail' || state.mode === 'edit') return state.employeeId;
  return null;
});

const selectedEmployee = computed(() => {
  if (activeEmployeeId.value === null) return null;
  return (
    employees.value.find((employee) => employee.id === activeEmployeeId.value) ??
    null
  );
});

const detailEmployee = computed(() => {
  const state = drawer.value;
  if (!state.open || state.mode !== 'detail') return null;
  return selectedEmployee.value;
});

const editEmployee = computed(() => {
  const state = drawer.value;
  if (!state.open || state.mode !== 'edit') return null;
  return selectedEmployee.value;
});

const detailIndex = computed(() => {
  if (activeEmployeeId.value === null) return -1;
  return filteredEmployees.value.findIndex(
    (employee) => employee.id === activeEmployeeId.value,
  );
});

const canGoPreviousEmployee = computed(() => detailIndex.value > 0);

const canGoNextEmployee = computed(
  () =>
    detailIndex.value >= 0 &&
    detailIndex.value < filteredEmployees.value.length - 1,
);

const drawerWidthClass = computed(() =>
  drawer.value.open ? 'w-full max-w-3xl' : 'w-full max-w-md',
);

const buildInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const handleCreateEmployee = (payload: EmployeeCreatePayload) => {
  const nextId =
    employees.value.reduce((max, employee) => Math.max(max, employee.id), 0) + 1;

  const created: Employee = {
    ...payload,
    id: nextId,
    initials: buildInitials(payload.name),
    employmentId: `EMP-${String(nextId).padStart(4, '0')}`,
  };

  employees.value = [created, ...employees.value];
  currentPage.value = 1;
  openDetailDrawer(created.id);
};

const handleUpdateEmployee = (payload: EmployeeUpdatePayload) => {
  const employeeId = activeEmployeeId.value;
  if (employeeId === null) return;

  employees.value = employees.value.map((employee) => {
    if (employee.id !== employeeId) return employee;

    return {
      ...employee,
      ...payload,
      initials: buildInitials(payload.name),
    };
  });

  openDetailDrawer(employeeId);
};

const isSelected = (id: number) => selectedIds.value.includes(id);

const openCreateDrawer = () => {
  drawer.value = { open: true, mode: 'create' };
};

const openDetailDrawer = (employeeId: number) => {
  drawer.value = { open: true, mode: 'detail', employeeId };
};

const openEditDrawer = (employeeId: number) => {
  drawer.value = { open: true, mode: 'edit', employeeId };
};

const closeDrawer = () => {
  drawer.value = { open: false };
};

const closeFormDrawer = () => {
  if (isEditDrawerOpen.value && activeEmployeeId.value !== null) {
    openDetailDrawer(activeEmployeeId.value);
    return;
  }
  closeDrawer();
};

const goToPreviousEmployee = () => {
  if (!canGoPreviousEmployee.value) return;
  const previous = filteredEmployees.value[detailIndex.value - 1];
  openDetailDrawer(previous.id);
};

const goToNextEmployee = () => {
  if (!canGoNextEmployee.value) return;
  const next = filteredEmployees.value[detailIndex.value + 1];
  openDetailDrawer(next.id);
};

const onEmployeeRowClick = (event: MouseEvent, id: number) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest('[data-row-action]')) return;
  openDetailDrawer(id);
};

const closeActionsMenu = () => {
  openActionsId.value = null;
};

const toggleActionsMenu = (employeeId: number) => {
  openActionsId.value =
    openActionsId.value === employeeId ? null : employeeId;
};

const onEditAction = (employeeId: number) => {
  closeActionsMenu();
  openEditDrawer(employeeId);
};

const onRemoveAction = (employeeId: number) => {
  closeActionsMenu();
  console.log('Remove employee:', employeeId);
};

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target?.closest('[data-actions-menu]')) {
    closeActionsMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});

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
    <Breadcrumb :items="breadcrumbItems" />

    <PageHeader
      title="Colaboradores"
      :subtitle="informationSubtitle"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f]"
          @click="openCreateDrawer"
        >
          Novo colaborador
          <span class="text-lg leading-none">+</span>
        </button>
      </template>
    </PageHeader>

    <div class="mb-6 grid grid-cols-4 gap-4">
      <StatCard
        v-for="card in statCards"
        :key="card.id"
        v-bind="card"
      />
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

        <div class="relative min-w-70 flex-1">
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

        <SelectFilter
          v-model="permissionFilter"
          :options="permissionOptions"
          placeholder="Filtrar por permissão"
          variant="pill"
          @change="onPermissionFilterChange"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-225 border-collapse text-left">
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
              class="cursor-pointer border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80"
              @click="onEmployeeRowClick($event, employee.id)"
            >
              <td class="py-4 pr-2 align-middle" data-row-action>
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
                  <UserAvatar
                    :initials="employee.initials"
                    size="sm"
                    :alt="employee.name"
                  />
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
                <StatusBadge
                  :label="employeeStatusBadge[employee.status].label"
                  :variant="employeeStatusBadge[employee.status].variant"
                />
              </td>

              <td
                class="relative py-4 pl-2 text-right align-middle"
                data-row-action
                data-actions-menu
              >
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  :aria-expanded="openActionsId === employee.id"
                  aria-haspopup="menu"
                  @click.stop="toggleActionsMenu(employee.id)"
                >
                  <Icon icon="carbon:overflow-menu-vertical" class="size-5" />
                </button>

                <div
                  v-if="openActionsId === employee.id"
                  role="menu"
                  class="absolute top-[calc(100%-0.5rem)] right-0 z-20 min-w-40 rounded-xl border border-gray-100 bg-white p-1.5 shadow-[0_12px_32px_rgba(16,22,37,0.12)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-[#f3f3f5]"
                    @click.stop="onEditAction(employee.id)"
                  >
                    <Icon icon="carbon:edit" class="size-4 text-gray-400" />
                    Editar
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    @click.stop="onRemoveAction(employee.id)"
                  >
                    <Icon icon="carbon:trash-can" class="size-4" />
                    Remover
                  </button>
                </div>
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
          <SelectFilter
            v-model="pageSize"
            :options="pageSizeOptions"
            variant="compact"
            placement="top"
            @change="onPageSizeChange"
          />
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

    <Drawer
      :open="drawer.open"
      :width-class="drawerWidthClass"
      @close="closeDrawer"
    >
      <EmployeeFormPanel
        v-if="isCreateDrawerOpen"
        @close="closeFormDrawer"
        @submit="handleCreateEmployee"
      />
      <EmployeeFormPanel
        v-else-if="isEditDrawerOpen && editEmployee"
        :employee="editEmployee"
        @close="closeFormDrawer"
        @submit="handleUpdateEmployee"
      />
      <EmployeeDetailPanel
        v-else-if="detailEmployee"
        :employee="detailEmployee"
        :can-go-previous="canGoPreviousEmployee"
        :can-go-next="canGoNextEmployee"
        @close="closeDrawer"
        @previous="goToPreviousEmployee"
        @next="goToNextEmployee"
        @edit="openEditDrawer(detailEmployee.id)"
      />
    </Drawer>
  </div>
</template>
