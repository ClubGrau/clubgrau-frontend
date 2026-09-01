<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
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
import ModalLayout from '../../components/Modal/ModalLayout.vue';
import { employeeStatusBadge } from '../../constants/employee-status';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import type { StatCardItem } from '../../types/stat-card';
import {
  useEmployeesScreen,
  type StatusFilter,
} from '../../composables/useEmployeesScreen';
import InactivateModal from '../../components/Modal/InactivateModal.vue';
import RemoveEmployeeModal from '../../components/Modal/RemoveEmployeeModal.vue';

const { t } = useI18n();

const {
  filteredEmployees,
  pageSize,
  currentPage,
  statusFilter,
  setStatusFilter,
  searchQuery,
  roleFilter,
  onRoleFilterChange,
  roleOptions,
  total,
  canCreate,
  drawer,
  isCreateDrawerOpen,
  isEditDrawerOpen,
  activeEmployeeId,
  detailEmployee,
  editEmployee,
  isDeactivateModalOpen,
  isRemoveModalOpen,
  modalWidthClass,
  canGoPreviousEmployee,
  canGoNextEmployee,
  drawerWidthClass,
  openCreateDrawer,
  openEditDrawer,
  openInactivateDrawer,
  openRemoveDrawer,
  closeDrawer,
  closeModal,
  closeFormDrawer,
  goToPreviousEmployee,
  goToNextEmployee,
  openActionsId,
  actionsMenuStyle,
  toggleActionsMenu,
  onEditAction,
  onDeactivateAction,
  onReactivateAction,
  onRemoveAction,
  isDeactivating,
  reactivate,
  isReactivating,
  isRemoving,
  removeError,
  isCreating,
  menuActions,
  detailActions,
  isSelfDeactivate,
  removeEmployeeName,
  handleCreateEmployee,
  handleUpdateEmployee,
  onEmployeeRowClick,
  handleInactivateEmployee,
  handleRemoveEmployee,
} = useEmployeesScreen();

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { id: 'dashboard', label: t('Employees.breadcrumb.dashboard'), to: '/app/dashboard' },
  { id: 'employees', label: t('Employees.breadcrumb.employees') },
]);

const informationSubtitle = computed(() =>
  t('Employees.subtitle', { total: total.value }),
);

const employeeRole = (role: string) => {
  return roleOptions.find((option) => option.value === role)?.label;
};

const statCards = computed<StatCardItem[]>(() => [
  {
    id: 'total',
    label: t('Employees.stats.total.label'),
    value: total.value,
    description: t('Employees.stats.total.description'),
  },
]);

const tabs = computed<{ label: string; value: StatusFilter }[]>(() => [
  { label: t('Employees.tabs.all'), value: 'todos' },
  { label: t('Employees.tabs.active'), value: 'ACTIVE' },
  { label: t('Employees.tabs.vacation'), value: 'VACATION' },
  { label: t('Employees.tabs.inactive'), value: 'INACTIVE' },
]);
</script>

<template>
  <div class="min-h-full bg-[#f5f5f7] px-8 pb-8 pt-5">
    <Breadcrumb :items="breadcrumbItems" />

    <PageHeader
      :title="t('Employees.title')"
      :subtitle="informationSubtitle"
    >
      <template #actions>
        <button
          v-if="canCreate"
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f]"
          @click="openCreateDrawer"
        >
          {{ t('Employees.newEmployee') }}
          <span class="text-lg leading-none">+</span>
        </button>
      </template>
    </PageHeader>

    <div class="mb-6 max-w-xs">
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
            :placeholder="t('Employees.searchPlaceholder')"
            class="w-full rounded-full border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-300"
          />
        </div>

        <SelectFilter
          v-model="roleFilter"
          :options="roleOptions"
          :placeholder="t('Employees.roleFilterPlaceholder')"
          variant="pill"
          @change="onRoleFilterChange"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-225 border-collapse text-left">
          <thead>
            <tr class="border-b border-gray-100 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
              <th class="py-3 pr-4 font-semibold">{{ t('Employees.table.name') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Employees.table.contacts') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Employees.table.nif') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Employees.table.role') }}</th>
              <th class="py-3 pr-4 font-semibold">{{ t('Employees.table.status') }}</th>
              <th class="py-3 pl-2 text-right font-semibold">{{ t('Employees.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="employee in filteredEmployees"
              :key="employee.id"
              class="cursor-pointer border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80"
              @click="onEmployeeRowClick($event, employee.id)"
            >
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
                    <span class="truncate font-semibold">{{ employee.email }}</span>
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
                {{ employeeRole(employee.role) }}
              </td>

              <td class="py-4 pr-4 align-middle">
                <StatusBadge
                  :label="employeeStatusBadge[employee.status].label"
                  :variant="employeeStatusBadge[employee.status].variant"
                />
              </td>

              <td
                class="py-4 pl-2 text-right align-middle"
                data-row-action
                data-actions-menu
              >
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  :aria-expanded="openActionsId === employee.id"
                  aria-haspopup="menu"
                  @click.stop="toggleActionsMenu(employee.id, $event.currentTarget)"
                >
                  <Icon icon="carbon:overflow-menu-vertical" class="size-5" />
                </button>
              </td>
            </tr>

            <tr v-if="filteredEmployees.length === 0">
              <td colspan="6" class="py-12 text-center text-sm text-gray-400">
                {{ t('Employees.empty') }}
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

    <Teleport to="body">
      <div
        v-if="openActionsId"
        data-actions-menu
        role="menu"
        class="fixed z-50 min-w-40 rounded-xl border border-gray-100 bg-white p-1.5 shadow-[0_12px_32px_rgba(16,22,37,0.12)]"
        :style="actionsMenuStyle"
      >
        <button
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-[#f3f3f5]"
          @click.stop="onEditAction(openActionsId)"
        >
          <Icon icon="carbon:edit" class="size-4 text-gray-400" />
          {{ t('Employees.menu.edit') }}
        </button>
        <button
          v-if="menuActions.canDeactivate"
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-[#f3f3f5]"
          @click.stop="onDeactivateAction(openActionsId)"
        >
          <Icon icon="carbon:user-follow" class="size-4 text-gray-400" />
          {{ t('Employees.menu.deactivate') }}
        </button>
        <button
          v-if="menuActions.canReactivate"
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-[#f3f3f5] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isReactivating"
          @click.stop="onReactivateAction(openActionsId)"
        >
          <Icon icon="carbon:reset" class="size-4 text-gray-400" />
          {{ t('Employees.menu.reactivate') }}
        </button>
        <button
          v-if="menuActions.canRemove"
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
          @click.stop="onRemoveAction(openActionsId)"
        >
          <Icon icon="carbon:trash-can" class="size-4" />
          {{ t('Employees.menu.remove') }}
        </button>
      </div>
    </Teleport>

    <Drawer
      :open="drawer.open && !isDeactivateModalOpen && !isRemoveModalOpen"
      :width-class="drawerWidthClass"
      @close="closeDrawer"
    >
      <EmployeeFormPanel
        v-if="isCreateDrawerOpen"
        :submitting="isCreating"
        @close="closeFormDrawer"
        @create="handleCreateEmployee"
      />
      <EmployeeFormPanel
        v-else-if="isEditDrawerOpen && editEmployee"
        :employee="editEmployee"
        @close="closeFormDrawer"
        @update="handleUpdateEmployee"
      />
      <EmployeeDetailPanel
        v-else-if="detailEmployee"
        :employee="detailEmployee"
        :can-go-previous="canGoPreviousEmployee"
        :can-go-next="canGoNextEmployee"
        :can-deactivate="detailActions.canDeactivate"
        :can-reactivate="detailActions.canReactivate"
        :can-remove="detailActions.canRemove"
        :reactivating="isReactivating"
        @close="closeDrawer"
        @previous="goToPreviousEmployee"
        @next="goToNextEmployee"
        @edit="openEditDrawer(detailEmployee.id)"
        @deactivate="openInactivateDrawer(detailEmployee.id)"
        @reactivate="reactivate(detailEmployee.id)"
        @remove="openRemoveDrawer(detailEmployee.id)"
      />
    </Drawer>

    <ModalLayout
      :open="isDeactivateModalOpen"
      :width-class="modalWidthClass"
      @close="closeModal"
    >
      <InactivateModal
        :employee-id="activeEmployeeId ?? ''"
        :is-self="isSelfDeactivate"
      />
      <template #footer>
        <button
          type="button"
          class="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          @click="closeModal"
        >
          {{ t('Employees.actions.cancel') }}
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#d64545] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c13c3c] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isDeactivating"
          :aria-busy="isDeactivating"
          @click="handleInactivateEmployee(activeEmployeeId ?? '')"
        >
          <Icon
            v-if="isDeactivating"
            icon="carbon:circle-dash"
            class="size-4 animate-spin"
          />
          {{ t('Employees.actions.deactivate') }}
        </button>
      </template>
    </ModalLayout>

    <ModalLayout
      :open="isRemoveModalOpen"
      :width-class="modalWidthClass"
      @close="closeModal"
    >
      <RemoveEmployeeModal
        :employee-name="removeEmployeeName"
        :is-submitting="isRemoving"
        :error-message="removeError"
        @submit="handleRemoveEmployee"
        @cancel="closeModal"
      />
    </ModalLayout>
  </div>
</template>
