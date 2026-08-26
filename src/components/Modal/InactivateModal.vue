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
      Inativar é uma parada operacional. A pessoa continua na lista, o email
      original permanece ocupado e você poderá reativá-la depois.
    </p>
  </div>
</template>
