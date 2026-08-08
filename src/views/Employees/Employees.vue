<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import Drawer from '../../components/Drawer/Drawer.vue';
import PageHeader from '../../components/PageHeader/PageHeader.vue';
import StatCard from '../../components/StatCard/StatCard.vue';
import Pagination from '../../components/Pagination/Pagination.vue';
import SelectFilter from '../../components/SelectFilter/SelectFilter.vue';
import StatusBadge from '../../components/StatusBadge/StatusBadge.vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import EmployeeFormPanel from './EmployeeFormPanel.vue';
import EmployeeDetailPanel from './EmployeeDetailPanel.vue';
import { employeeStatusBadge } from '../../constants/employee-status';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import type {
  EmployeeCreatePayload,
  EmployeeUpdatePayload,
} from '../../types/employee';
import type { StatCardItem } from '../../types/stat-card';
import { useEmployeeDrawer } from '../../composables/useEmployeeDrawer';
import { useEmployeeSelection } from '../../composables/useEmployeeSelection';
import {
  useEmployees,
  type StatusFilter,
} from '../../composables/useEmployees';
import { httpEmployeesApi } from '../../services/api/employees/http-employees-api';

const {
  employees,
  filteredEmployees,
  pageSize,
  currentPage,
  statusFilter,
  setStatusFilter,
  searchQuery,
  onSearchQueryChange,
  permissionFilter,
  onPermissionFilterChange,
  permissionOptions,
  stats,
  total,
  isLoading,
  refetch,
} = useEmployees(httpEmployeesApi);

const {
  drawer,
  isCreateDrawerOpen,
  isEditDrawerOpen,
  activeEmployeeId,
  detailEmployee,
  editEmployee,
  canGoPreviousEmployee,
  canGoNextEmployee,
  drawerWidthClass,
  openCreateDrawer,
  openDetailDrawer,
  openEditDrawer,
  closeDrawer,
  closeFormDrawer,
  goToPreviousEmployee,
  goToNextEmployee,
} = useEmployeeDrawer(employees, filteredEmployees);

const {
  openActionsId,
  isSelected,
  toggleSelect,
  toggleActionsMenu,
  onEditAction,
  onRemoveAction,
} = useEmployeeSelection({
  onEdit: openEditDrawer,
  onRemove: (employeeId) => {
    console.log('Remove employee:', employeeId);
  },
});

const breadcrumbItems: BreadcrumbItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/app/dashboard' },
  { id: 'employees', label: 'Colaboradores' },
];

const informationSubtitle = computed(() => {
  return `${stats.value.total} pessoas cadastradas · ${stats.value.ativos} ativas · ${stats.value.ferias} em férias`;
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

const tabs: { label: string; value: StatusFilter }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Ativos', value: 'ativo' },
  { label: 'Férias', value: 'ferias' },
  { label: 'Inativos', value: 'inativo' },
];

const handleCreateEmployee = (_payload: EmployeeCreatePayload) => {
  currentPage.value = 1;
  closeDrawer();
  void refetch();
};

const handleUpdateEmployee = (_payload: EmployeeUpdatePayload) => {
  const employeeId = activeEmployeeId.value;
  if (employeeId === null) return;

  openDetailDrawer(employeeId);
  void refetch();
};

const onEmployeeRowClick = (event: MouseEvent, id: string) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest('[data-row-action]')) return;
  openDetailDrawer(id);
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
            @input="onSearchQueryChange"
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
              v-for="employee in filteredEmployees"
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

            <tr v-if="filteredEmployees.length === 0">
              <td colspan="7" class="py-12 text-center text-sm text-gray-400">
                Nenhum colaborador encontrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-items="total"
        page-size-placement="top"
      />
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
