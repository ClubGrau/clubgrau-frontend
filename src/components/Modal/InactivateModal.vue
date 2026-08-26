<script setup lang="ts">
interface Props {
  employeeId: string;
}

withDefaults(defineProps<Props>(), {
  employeeId: '',
});
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900">
      Inativar colaborador
    </h2>
    <p class="mt-1 text-sm text-gray-400">
      Esta ação revoga os acessos do colaborador ao sistema. Você poderá
      reativar o colaborador depois.
    </p>
  </div>
</template>
