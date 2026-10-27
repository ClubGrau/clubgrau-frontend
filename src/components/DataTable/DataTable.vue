<script setup lang="ts" generic="T">
import { computed, useSlots } from 'vue';
import Pagination from '../Pagination/Pagination.vue';
import type { DataTableColumn, DataTablePagination } from '../../types/data-table';

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[];
    rows: T[];
    rowKey: keyof T & string;
    loading?: boolean;
    busy?: boolean;
    label?: string;
    pagination?: DataTablePagination;
  }>(),
  {
    loading: false,
    busy: false,
  },
);

const emit = defineEmits<{
  rowClick: [event: MouseEvent, row: T];
  'update:currentPage': [page: number];
  'update:pageSize': [size: number];
}>();

const slots = useSlots();

const replacesTable = computed(
  () => !props.loading && props.rows.length === 0 && Boolean(slots['empty-state']),
);

const paginationBindings = computed(() => {
  if (!props.pagination) return null;
  const { currentPage, pageSize, totalItems, ...optional } = props.pagination;
  const definedOptional = Object.fromEntries(
    Object.entries(optional).filter(([, value]) => value !== undefined),
  );
  return {
    currentPage,
    pageSize,
    totalItems,
    ...definedOptional,
  };
});

const headerClass = (column: DataTableColumn) =>
  column.align === 'right' ? 'py-3 pl-2 text-right font-semibold' : 'py-3 pr-4 font-semibold';

const cellClass = (column: DataTableColumn) =>
  column.align === 'right' ? 'py-4 pl-2 text-right align-middle' : 'py-4 pr-4 align-middle';

const rowId = (row: T) => String(row[props.rowKey]);

const onRowClick = (event: MouseEvent, row: T) => {
  emit('rowClick', event, row);
};
</script>

<template>
  <div>
    <slot v-if="replacesTable" name="empty-state" />

    <div
      v-else
      class="overflow-x-auto"
      :aria-busy="loading || busy || undefined"
      :aria-label="label"
    >
      <table class="w-full min-w-225 border-collapse text-left">
      <thead>
        <tr class="border-b border-gray-100 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="headerClass(column)"
            :aria-sort="column.ariaSort"
          >
            <slot :name="`header-${column.key}`" :column="column">
              {{ column.label }}
            </slot>
          </th>
        </tr>
      </thead>

      <tbody :class="busy && !loading ? 'opacity-60' : undefined">
        <slot v-if="loading" name="loading" :columns="columns" />

        <template v-else-if="rows.length > 0">
          <tr
            v-for="row in rows"
            :key="rowId(row)"
            class="cursor-pointer border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80"
            @click="onRowClick($event, row)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="cellClass(column)"
              :data-row-action="column.stopsRowClick ? '' : undefined"
              :data-actions-menu="column.actionsTrigger ? '' : undefined"
            >
              <slot :name="`cell-${column.key}`" :row="row" :column="column" />
            </td>
          </tr>
        </template>

        <tr v-else-if="$slots.empty">
          <td :colspan="columns.length" class="py-12 text-center text-sm text-gray-400">
            <slot name="empty" />
          </td>
        </tr>
      </tbody>
      </table>
    </div>

    <Pagination
      v-if="paginationBindings"
      v-bind="paginationBindings"
      @update:current-page="emit('update:currentPage', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    />
  </div>
</template>
