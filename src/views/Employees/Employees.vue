<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import ActionsMenu from '../../components/ActionsMenu/ActionsMenu.vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import DataTable from '../../components/DataTable/DataTable.vue';
import Drawer from '../../components/Drawer/Drawer.vue';
import PageHeader from '../../components/PageHeader/PageHeader.vue';
import StatCard from '../../components/StatCard/StatCard.vue';
import Pagination from '../../components/Pagination/Pagination.vue';
import SelectFilter from '../../components/SelectFilter/SelectFilter.vue';
import StatusBadge from '../../components/StatusBadge/StatusBadge.vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import OwnEmployeeDataForm from '../../components/ProfileCard/OwnEmployeeDataForm.vue';
import EmployeeFormPanel from './EmployeeFormPanel.vue';
import EmployeeDetailPanel from './EmployeeDetailPanel.vue';
import ModalLayout from '../../components/Modal/ModalLayout.vue';
import emptyListImage from '../../assets/img/empty-list.png';
import { employeeStatusBadge } from '../../constants/employee-status';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import type { DataTableColumn } from '../../types/data-table';
import type { Employee } from '../../types/employee';
import type { StatCardItem } from '../../types/stat-card';
import {
  useEmployeesScreen,
  type StatusFilter,
} from '../../composables/useEmployeesScreen';
import InactivateModal from '../../components/Modal/InactivateModal.vue';
import RemoveEmployeeModal from '../../components/Modal/RemoveEmployeeModal.vue';
import PageContainer from '../../Layout/PageContainer.vue';

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
  stats,
  total,
  isListLoading,
  isListFetching,
  isStatsLoading,
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
  isUpdatingMain,
  isUpdatingPersonal,
  isUpdatingProfessional,
  menuActions,
  detailActions,
  isSelfDeactivate,
  removeEmployeeName,
  handleCreateEmployee,
  handleUpdateMainEmployee,
  handleUpdatePersonalEmployee,
  handleUpdateProfessionalEmployee,
  onEmployeeRowClick,
  handleInactivateEmployee,
  handleRemoveEmployee,
  isOwnFormOpen,
  ownEmployee,
  isOwnEmployeeLoadError,
  isSavingOwnEmployee,
  closeOwnForm,
  retryOwnEmployeeLoad,
  saveOwnEmployee,
} = useEmployeesScreen();

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { id: 'dashboard', label: t('Employees.breadcrumb.dashboard'), to: '/app/dashboard' },
  { id: 'employees', label: t('Employees.breadcrumb.employees') },
]);

const informationSubtitle = computed(() =>
  t('Employees.subtitle', {
    total: stats.value.total,
    ativos: stats.value.ativos,
    ferias: stats.value.ferias,
  }),
);

const employeeRole = (role: string) => {
  return roleOptions.find((option) => option.value === role)?.label;
};

const employeeUsername = (username: string) => {
  return username && `@${username}`;
};

const columns = computed<DataTableColumn[]>(() => [
  { key: 'name', label: t('Employees.table.name') },
  { key: 'contacts', label: t('Employees.table.contacts') },
  { key: 'nif', label: t('Employees.table.nif') },
  { key: 'role', label: t('Employees.table.role') },
  { key: 'status', label: t('Employees.table.status') },
  {
    key: 'actions',
    label: t('Employees.table.actions'),
    align: 'right',
    stopsRowClick: true,
    actionsTrigger: true,
  },
]);

const onEmployeeTableRowClick = (event: MouseEvent, employee: Employee.ListItem) => {
  onEmployeeRowClick(event, employee.id);
};

const statCards = computed<StatCardItem[]>(() => [
  {
    id: 'total',
    label: t('Employees.stats.total.label'),
    value: stats.value.total,
    description: t('Employees.stats.total.description'),
    icon: 'carbon:user-multiple',
    tone: 'neutral',
  },
  {
    id: 'active',
    label: t('Employees.stats.active.label'),
    value: stats.value.ativos,
    description: t('Employees.stats.active.description'),
    icon: 'carbon:checkmark-filled',
    tone: 'success',
  },
  {
    id: 'vacation',
    label: t('Employees.stats.vacation.label'),
    value: stats.value.ferias,
    description: t('Employees.stats.vacation.description'),
    icon: 'carbon:sun',
    tone: 'warning',
  },
  {
    id: 'inactive',
    label: t('Employees.stats.inactive.label'),
    value: stats.value.inativos,
    description: t('Employees.stats.inactive.description'),
    icon: 'carbon:locked',
    tone: 'danger',
  },
]);

const emptyMessage = computed(() =>
  statusFilter.value === 'VACATION'
    ? t('Employees.emptyVacation')
    : t('Employees.empty'),
);

const tabs = computed<{ label: string; value: StatusFilter }[]>(() => [
  { label: t('Employees.tabs.all'), value: 'todos' },
  { label: t('Employees.tabs.active'), value: 'ACTIVE' },
  { label: t('Employees.tabs.vacation'), value: 'VACATION' },
  { label: t('Employees.tabs.inactive'), value: 'INACTIVE' },
]);

const statusTabsRef = ref<HTMLElement | null>(null);
let statusTabsPointerId: number | null = null;
let statusTabsStartX = 0;
let statusTabsStartScroll = 0;
let statusTabsDragged = false;

const stopStatusTabsDrag = () => {
  statusTabsPointerId = null;
  window.removeEventListener('pointermove', onStatusTabsPointerMove);
  window.removeEventListener('pointerup', onStatusTabsPointerUp);
  window.removeEventListener('pointercancel', onStatusTabsPointerUp);
};

function onStatusTabsPointerMove(event: PointerEvent) {
  if (statusTabsPointerId !== event.pointerId) return;
  const scroller = statusTabsRef.value;
  if (!scroller) return;
  const delta = event.clientX - statusTabsStartX;
  if (Math.abs(delta) <= 4) return;
  if (scroller.scrollWidth <= scroller.clientWidth) return;
  statusTabsDragged = true;
  scroller.scrollLeft = statusTabsStartScroll - delta;
}

function onStatusTabsPointerUp(event: PointerEvent) {
  if (statusTabsPointerId !== event.pointerId) return;
  const dragged = statusTabsDragged;
  stopStatusTabsDrag();
  if (!dragged) return;

  const swallowClick = (clickEvent: MouseEvent) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    statusTabsDragged = false;
  };
  window.addEventListener('click', swallowClick, { capture: true, once: true });
  requestAnimationFrame(() => {
    window.removeEventListener('click', swallowClick, { capture: true });
    statusTabsDragged = false;
  });
}

function onStatusTabsPointerDown(event: PointerEvent) {
  if (event.pointerType === 'touch' || event.button !== 0) return;
  const scroller = statusTabsRef.value;
  if (!scroller) return;
  statusTabsPointerId = event.pointerId;
  statusTabsStartX = event.clientX;
  statusTabsStartScroll = scroller.scrollLeft;
  statusTabsDragged = false;
  window.addEventListener('pointermove', onStatusTabsPointerMove);
  window.addEventListener('pointerup', onStatusTabsPointerUp);
  window.addEventListener('pointercancel', onStatusTabsPointerUp);
}

function onStatusTabClick(value: StatusFilter) {
  if (statusTabsDragged) {
    statusTabsDragged = false;
    return;
  }
  setStatusFilter(value);
}

onUnmounted(stopStatusTabsDrag);
</script>

<template>
  <PageContainer>
    <Breadcrumb :items="breadcrumbItems" />

    <PageHeader :title="t('Employees.title')">
      <template #subtitle>
        <span
          v-if="isStatsLoading"
          class="block h-10 w-full max-w-sm animate-pulse rounded bg-gray-200 md:h-5 md:max-w-72"
          aria-hidden="true"
        />
        <span v-else class="block min-h-10 md:min-h-5">{{ informationSubtitle }}</span>
      </template>
      <template #actions>
        <button
          v-if="canCreate"
          type="button"
          class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f] md:w-auto"
          @click="openCreateDrawer"
        >
          {{ t('Employees.newEmployee') }}
          <span class="text-lg leading-none">+</span>
        </button>
      </template>
    </PageHeader>

    <div
      class="mb-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scrollbar-none lg:grid lg:snap-none lg:grid-cols-4 lg:gap-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      <StatCard
        v-for="card in statCards"
        :key="card.id"
        class="w-[calc(100%-3rem)] shrink-0 snap-start md:w-72 lg:w-auto lg:shrink lg:snap-align-none"
        v-bind="card"
      >
        <template v-if="isStatsLoading" #value>
          <span
            class="block h-9 w-12 animate-pulse rounded-md bg-current/20"
            aria-hidden="true"
          />
        </template>
      </StatCard>
    </div>

    <!-- Table card -->
    <section class="rounded-2xl bg-white p-5 shadow-sm">
      <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="flex min-w-0 items-center gap-2 lg:contents">
          <div
            ref="statusTabsRef"
            class="min-w-0 shrink cursor-grab touch-pan-x overflow-x-auto overscroll-x-contain rounded-full bg-[#f3f3f5] p-1 scrollbar-none select-none active:cursor-grabbing lg:order-1 [&::-webkit-scrollbar]:hidden"
            @pointerdown="onStatusTabsPointerDown"
          >
            <div class="flex w-max items-center gap-1">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                type="button"
                class="shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors overflow-hidden"
                :class="
                  statusFilter === tab.value
                    ? 'bg-[#5c5c66] font-medium text-white'
                    : 'text-gray-500 hover:text-gray-700'
                "
                @click="onStatusTabClick(tab.value)"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div
            class="w-[38%] max-w-44 min-w-26 shrink-0 lg:order-3 lg:w-auto lg:max-w-none lg:min-w-45 lg:shrink [&_button]:min-w-0! lg:[&_button]:min-w-45!"
          >
            <SelectFilter
              v-model="roleFilter"
              class="w-full lg:w-auto"
              :options="roleOptions"
              :placeholder="t('Employees.roleFilterPlaceholder')"
              variant="pill"
              @change="onRoleFilterChange"
            />
          </div>
        </div>

        <div class="relative w-full lg:order-2 lg:min-w-70 lg:w-auto lg:flex-1">
          <Icon
            icon="carbon:search"
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('Employees.searchPlaceholder')"
            class="w-full rounded-full border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/30"
          />
        </div>
      </div>

      <DataTable
        v-if="isListLoading || filteredEmployees.length > 0"
        :columns="columns"
        :rows="filteredEmployees"
        row-key="id"
        :loading="isListLoading"
        :busy="isListFetching"
        :label="isListLoading ? t('Employees.loading') : undefined"
        @row-click="onEmployeeTableRowClick"
      >
        <template #loading>
          <tr
            v-for="row in pageSize"
            :key="`skeleton-${row}`"
            class="border-b border-gray-50 last:border-b-0"
          >
            <td class="py-4 pr-4 align-middle">
              <div class="flex items-center gap-3">
                <div class="size-9 shrink-0 animate-pulse rounded-full bg-gray-100" />
                <div class="space-y-2">
                  <div class="h-3.5 w-32 animate-pulse rounded bg-gray-100" />
                  <div class="h-3 w-20 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            </td>
            <td class="py-4 pr-4 align-middle">
              <div class="space-y-2">
                <div class="h-3 w-40 animate-pulse rounded bg-gray-100" />
                <div class="h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>
            </td>
            <td class="py-4 pr-4 align-middle">
              <div class="h-3.5 w-24 animate-pulse rounded bg-gray-100" />
            </td>
            <td class="py-4 pr-4 align-middle">
              <div class="h-3.5 w-20 animate-pulse rounded bg-gray-100" />
            </td>
            <td class="py-4 pr-4 align-middle">
              <div class="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
            </td>
            <td class="py-4 pl-2 text-right align-middle">
              <div class="ml-auto size-5 animate-pulse rounded bg-gray-100" />
            </td>
          </tr>
        </template>

        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <UserAvatar
              :initials="row.initials"
              size="sm"
              :alt="row.name"
            />
            <div class="min-w-0 leading-tight">
              <p class="truncate text-sm font-semibold text-gray-900">
                {{ row.name }}
              </p>
              <p class="truncate text-xs text-gray-400">{{ employeeUsername(row.username) }}</p>
            </div>
          </div>
        </template>

        <template #cell-contacts="{ row }">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Icon icon="carbon:email" class="size-3.5 shrink-0 text-gray-400" />
              <span class="truncate font-semibold">{{ row.email }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Icon icon="carbon:phone" class="size-3.5 shrink-0 text-gray-400" />
              <span>{{ row.phone }}</span>
            </div>
          </div>
        </template>

        <template #cell-nif="{ row }">
          <span class="text-sm text-gray-700">{{ row.nif }}</span>
        </template>

        <template #cell-role="{ row }">
          <span class="text-sm text-gray-700">{{ employeeRole(row.role) }}</span>
        </template>

        <template #cell-status="{ row }">
          <StatusBadge
            :label="employeeStatusBadge[row.status].label"
            :variant="employeeStatusBadge[row.status].variant"
          />
        </template>

        <template #cell-actions="{ row }">
          <button
            type="button"
            class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            :aria-expanded="openActionsId === row.id"
            aria-haspopup="menu"
            @click.stop="toggleActionsMenu(row.id, $event.currentTarget)"
          >
            <Icon icon="carbon:overflow-menu-vertical" class="size-5" />
          </button>
        </template>
      </DataTable>

      <div
        v-else
        class="flex min-h-72 flex-col items-center justify-center gap-4 px-4 py-10 text-center sm:min-h-80 sm:py-14"
      >
        <img
          :src="emptyListImage"
          alt=""
          width="434"
          height="260"
          class="h-auto w-36 max-w-full sm:w-44"
        />
        <p class="max-w-md text-base text-gray-700 sm:text-lg">
          {{ emptyMessage }}
        </p>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-items="total"
        page-size-placement="top"
      />
    </section>

    <ActionsMenu :open="openActionsId !== null" :menu-style="actionsMenuStyle">
      <template v-if="openActionsId">
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
      </template>
    </ActionsMenu>

    <Drawer
      :open="(drawer.open && !isDeactivateModalOpen && !isRemoveModalOpen) || isOwnFormOpen"
      :width-class="isOwnFormOpen ? 'w-full max-w-3xl' : drawerWidthClass"
      @close="isOwnFormOpen ? closeOwnForm() : closeDrawer()"
    >
      <OwnEmployeeDataForm
        v-if="isOwnFormOpen"
        :employee="ownEmployee"
        :load-failed="isOwnEmployeeLoadError"
        :submitting="isSavingOwnEmployee"
        @close="closeOwnForm"
        @retry="retryOwnEmployeeLoad"
        @save="saveOwnEmployee"
      />
      <EmployeeFormPanel
        v-else-if="isCreateDrawerOpen"
        :submitting="isCreating"
        @close="closeFormDrawer"
        @create="handleCreateEmployee"
      />
      <EmployeeFormPanel
        v-else-if="isEditDrawerOpen && editEmployee"
        :employee="editEmployee"
        :submitting-main="isUpdatingMain"
        :submitting-personal="isUpdatingPersonal"
        :submitting-professional="isUpdatingProfessional"
        @close="closeFormDrawer"
        @update-main="handleUpdateMainEmployee"
        @update-personal="handleUpdatePersonalEmployee"
        @update-professional="handleUpdateProfessionalEmployee"
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
  </PageContainer>
</template>
