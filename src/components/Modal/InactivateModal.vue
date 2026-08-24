<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  employeeId: string;
  mode?: 'inactivate' | 'remove';
}

const props = withDefaults(defineProps<Props>(), {
  employeeId: '',
  mode: 'inactivate',
});

const emit = defineEmits<{
  onRemoveAction: [employeeId: string];
}>();

const isRemoveMode = computed(() => props.mode === 'remove');
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900">
      {{ isRemoveMode ? 'Remover colaborador' : 'Inativar colaborador' }}
    </h2>
    <p class="mt-1 text-sm text-gray-400">
      <template v-if="isRemoveMode">
        Esta ação remove o colaborador do sistema de forma permanente.
      </template>
      <template v-else>
        Esta ação revoga os acessos do colaborador ao sistema. Você poderá
        reativar o colaborador depois.
      </template>
    </p>
    <p
      v-if="!isRemoveMode"
      class="mt-6 mb-4 text-sm text-gray-400"
    >
      Para remover o colaborador do sistema
      <button
        type="button"
        class="cursor-pointer font-medium text-[#e69138] hover:underline"
        @click="emit('onRemoveAction', employeeId)"
      >
        clique aqui
      </button>.
    </p>
  </div>
</template>
