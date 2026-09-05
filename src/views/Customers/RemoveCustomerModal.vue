<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  customerName: string;
}>();

const { t } = useI18n();

const removeBody = computed(() =>
  props.customerName
    ? t('Customers.modal.removeBodyNamed', { name: props.customerName })
    : t('Customers.modal.removeBodyAnonymous'),
);
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900">
      {{ t('Customers.modal.removeTitle') }}
    </h2>
    <p class="mt-1 text-sm text-gray-400">
      {{ removeBody }}
    </p>
  </div>
</template>
