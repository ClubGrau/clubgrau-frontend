<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import StatusBadge from '../../components/StatusBadge/StatusBadge.vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import { employeeStatusBadge } from '../../constants/employee-status';
import type { Employee } from '../../types/employee';

interface EmployeeDetailPanelProps {
  employee: Employee.ListItem;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  canDeactivate?: boolean;
  canReactivate?: boolean;
  canRemove?: boolean;
  reactivating?: boolean;
}

const props = defineProps<EmployeeDetailPanelProps>();

const emit = defineEmits<{
  close: [];
  previous: [];
  next: [];
  edit: [];
  message: [];
  deactivate: [];
  reactivate: [];
  remove: [];
}>();

const { t } = useI18n();

type DetailTab = 'details' | 'payroll';

const activeTab = ref<DetailTab>('details');

watch(
  () => props.employee.id,
  () => {
    activeTab.value = 'details';
  },
);

const tabs = computed(() => [
  { id: 'details' as const, label: t('Employees.detail.tabDetails') },
  { id: 'payroll' as const, label: t('Employees.detail.tabPayroll') },
]);

function optionalDisplay(value: string | undefined): string {
  if (value === undefined || value.trim() === '') return t('Employees.detail.empty');
  return value;
}

const personalFields = computed(() => [
  { label: t('Employees.detail.fullName'), value: props.employee.name },
  { label: t('Employees.detail.languages'), value: optionalDisplay(props.employee.languages) },
  { label: t('Employees.detail.gender'), value: optionalDisplay(props.employee.gender) },
  {
    label: t('Employees.detail.emergencyContact'),
    value: optionalDisplay(props.employee.emergencyContact),
    icon: 'carbon:phone',
  },
  {
    label: t('Employees.detail.address'),
    value: optionalDisplay(props.employee.address),
    fullWidth: true,
  },
]);

const professionalFields = computed(() => [
  {
    label: t('Employees.detail.employmentId'),
    value: optionalDisplay(props.employee.employmentId),
  },
  { label: t('Employees.detail.jobTitle'), value: optionalDisplay(props.employee.jobTitle) },
  { label: t('Employees.detail.role'), value: props.employee.role },
  { label: t('Employees.detail.status'), value: employeeStatusBadge[props.employee.status].label },
]);
</script>

<template>
  <div class="flex h-full flex-col bg-[#f7f7f8]">
    <header class="shrink-0 border-b border-gray-100 bg-white px-5 pt-4 pb-5">
      <div class="mb-5 flex items-center justify-between">
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="!canGoPrevious"
            :aria-label="t('Employees.detail.previous')"
            @click="emit('previous')"
          >
            <Icon icon="carbon:chevron-left" class="size-5" />
          </button>
          <button
            type="button"
            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="!canGoNext"
            :aria-label="t('Employees.detail.next')"
            @click="emit('next')"
          >
            <Icon icon="carbon:chevron-right" class="size-5" />
          </button>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            :aria-label="t('Employees.detail.edit')"
            @click="emit('edit')"
          >
            <Icon icon="carbon:edit" class="size-4" />
          </button>
          <button
            type="button"
            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            :aria-label="t('Employees.detail.message')"
            @click="emit('message')"
          >
            <Icon icon="carbon:send" class="size-4" />
          </button>
          <button
            v-if="canDeactivate"
            type="button"
            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            :aria-label="t('Employees.detail.deactivate')"
            @click="emit('deactivate')"
          >
            <Icon icon="carbon:user-follow" class="size-4" />
          </button>
          <button
            v-if="canReactivate"
            type="button"
            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
            :aria-label="t('Employees.detail.reactivate')"
            :disabled="reactivating"
            :aria-busy="reactivating"
            @click="emit('reactivate')"
          >
            <Icon
              :icon="reactivating ? 'carbon:circle-dash' : 'carbon:reset'"
              :class="reactivating ? 'size-4 animate-spin' : 'size-4'"
            />
          </button>
          <button
            v-if="canRemove"
            type="button"
            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            :aria-label="t('Employees.detail.remove')"
            @click="emit('remove')"
          >
            <Icon icon="carbon:trash-can" class="size-4" />
          </button>
          <button
            type="button"
            class="ml-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            :aria-label="t('Employees.detail.close')"
            @click="emit('close')"
          >
            <Icon icon="carbon:close" class="size-5" />
          </button>
        </div>
      </div>

      <div class="flex gap-4">
        <UserAvatar
          :initials="employee.initials"
          size="lg"
          :alt="employee.name"
        />

        <div class="min-w-0 flex-1">
          <div class="mb-1 flex flex-wrap items-center gap-2">
            <h2 class="truncate text-xl font-semibold text-gray-900">
              {{ employee.name }}
            </h2>
            <StatusBadge
              :label="employeeStatusBadge[employee.status].label"
              :variant="employeeStatusBadge[employee.status].variant"
              size="sm"
            />
            <span class="text-sm text-gray-500">{{ optionalDisplay(employee.jobTitle) }}</span>
          </div>

          <div class="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <div class="text-sm">
              <span class="text-gray-400">{{ t('Employees.detail.employmentId') }}: </span>
              <span class="font-medium text-gray-800">{{ optionalDisplay(employee.employmentId) }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-700">
              <Icon icon="carbon:email" class="size-4 shrink-0 text-gray-400" />
              <span class="truncate">{{ employee.email }}</span>
            </div>
            <div class="text-sm">
              <span class="text-gray-400">{{ t('Employees.detail.role') }}: </span>
              <span class="font-medium text-gray-800">{{ employee.role }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-700">
              <Icon icon="carbon:phone" class="size-4 shrink-0 text-gray-400" />
              <span>{{ optionalDisplay(employee.phone) }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <nav class="shrink-0 border-b border-gray-200 bg-white px-5">
      <div class="flex gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="relative cursor-pointer py-3 text-xs font-semibold tracking-wide uppercase transition-colors"
          :class="
            activeTab === tab.id
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span
            v-if="activeTab === tab.id"
            class="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#e69138]"
          />
        </button>
      </div>
    </nav>

    <div class="flex-1 overflow-y-auto px-5 py-5">
      <template v-if="activeTab === 'details'">
        <section class="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            {{ t('Employees.detail.personalInfo') }}
          </h3>

          <div class="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div
              v-for="field in personalFields"
              :key="field.label"
              :class="field.fullWidth ? 'sm:col-span-2' : ''"
            >
              <p class="mb-1 text-xs text-gray-400">{{ field.label }}</p>
              <p class="flex items-start gap-2 text-sm font-semibold text-gray-900">
                <Icon
                  v-if="field.icon"
                  :icon="field.icon"
                  class="mt-0.5 size-4 shrink-0 text-gray-400"
                />
                <span>{{ field.value }}</span>
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-gray-900">
            {{ t('Employees.detail.professionalInfo') }}
          </h3>

          <div class="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div
              v-for="field in professionalFields"
              :key="field.label"
            >
              <p class="mb-1 text-xs text-gray-400">{{ field.label }}</p>
              <p class="text-sm font-semibold text-gray-900">{{ field.value }}</p>
            </div>
          </div>
        </section>
      </template>

      <template v-else>
        <section class="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <p class="text-sm text-gray-400">{{ t('Employees.detail.payrollSoon') }}</p>
        </section>
      </template>
    </div>
  </div>
</template>
