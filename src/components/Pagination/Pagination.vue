<script setup lang="ts">
import { computed } from 'vue';
import SelectFilter from '../SelectFilter/SelectFilter.vue';
import type { PaginationPageItem } from '../../types/pagination';
import type { SelectFilterOption, SelectFilterPlacement } from '../../types/select-filter';

const props = withDefaults(
  defineProps<{
    currentPage: number;
    pageSize: number;
    totalItems: number;
    pageSizeOptions?: SelectFilterOption[];
    pageSizePlacement?: SelectFilterPlacement;
    previousLabel?: string;
    nextLabel?: string;
    showingLabel?: string;
    resultsLabel?: string;
  }>(),
  {
    pageSizeOptions: () => [
      { id: 5, label: '5', value: 5 },
      { id: 10, label: '10', value: 10 },
      { id: 20, label: '20', value: 20 },
    ],
    pageSizePlacement: 'bottom',
    previousLabel: 'Anterior',
    nextLabel: 'Próximo',
    showingLabel: 'Exibindo',
    resultsLabel: 'resultados',
  },
);

const emit = defineEmits<{
  'update:currentPage': [page: number];
  'update:pageSize': [size: number];
  change: [payload: { page: number; pageSize: number }];
}>();

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.totalItems / props.pageSize)),
);

const pageNumbers = computed<PaginationPageItem[]>(() => {
  const total = totalPages.value;
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  return [1, 2, 3, 4, 'ellipsis', total];
});

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === props.currentPage) return;
  emit('update:currentPage', page);
  emit('change', { page, pageSize: props.pageSize });
};

const onPageSizeChange = (value: string | number) => {
  const size = Number(value);
  emit('update:pageSize', size);
  emit('update:currentPage', 1);
  emit('change', { page: 1, pageSize: size });
};
</script>

<template>
  <div
    class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4"
  >
    <div class="flex items-center gap-2 text-sm text-gray-500">
      <slot name="showing-label">
        <span>{{ showingLabel }}</span>
      </slot>

      <SelectFilter
        :model-value="pageSize"
        :options="pageSizeOptions"
        variant="compact"
        :placement="pageSizePlacement"
        @update:model-value="onPageSizeChange"
      />

      <slot name="results-label" :total="totalItems">
        <span>de {{ totalItems }} {{ resultsLabel }}</span>
      </slot>
    </div>

    <div class="flex items-center gap-1 text-sm">
      <button
        type="button"
        class="cursor-pointer px-2 py-1 text-gray-500 transition-colors hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <slot name="previous">{{ previousLabel }}</slot>
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
        <slot name="next">{{ nextLabel }}</slot>
      </button>
    </div>
  </div>
</template>
