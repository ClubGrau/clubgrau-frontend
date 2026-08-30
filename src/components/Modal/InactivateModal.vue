<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Props {
  employeeId: string;
  isSelf?: boolean;
}

withDefaults(defineProps<Props>(), {
  employeeId: '',
  isSelf: false,
});

const { t } = useI18n();
</script>

<template>
  <div>
    <template v-if="isSelf">
      <h2 class="text-lg font-semibold text-gray-900">
        {{ t('Employees.modal.deactivateSelfTitle') }}
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        {{ t('Employees.modal.deactivateSelfBody') }}
      </p>
    </template>
    <template v-else>
      <h2 class="text-lg font-semibold text-gray-900">
        {{ t('Employees.modal.deactivateTitle') }}
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        {{ t('Employees.modal.deactivateBody') }}
      </p>
    </template>
  </div>
</template>
