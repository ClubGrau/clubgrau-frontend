<script setup lang="ts">
interface Props {
  employeeId: string;
  isSelf?: boolean;
}

withDefaults(defineProps<Props>(), {
  employeeId: '',
  isSelf: false,
});
</script>

<template>
  <div>
    <template v-if="isSelf">
      <h2 class="text-lg font-semibold text-gray-900">
        Inativar a sua conta
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        Esta ação inativa a sua própria conta. Você será desconectado e perderá
        o acesso ao sistema. Não será possível reativar a si mesmo.
      </p>
    </template>
    <template v-else>
      <h2 class="text-lg font-semibold text-gray-900">
        Inativar colaborador
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        Inativar é uma parada operacional. A pessoa continua na lista, o email
        original permanece ocupado e você poderá reativá-la depois.
      </p>
    </template>
  </div>
</template>
