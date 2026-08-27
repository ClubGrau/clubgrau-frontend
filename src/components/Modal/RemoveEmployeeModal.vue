<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import PasswordRevealler from '../PasswordRevealler.vue'

const props = defineProps<{
  employeeName: string
  isSubmitting: boolean
  errorMessage: string | null
}>()

const emit = defineEmits<{
  submit: [password: string]
  cancel: []
}>()

const password = ref('')
const showPassword = ref(false)

const clearPassword = () => {
  password.value = ''
  showPassword.value = false
}

const submit = () => {
  if (props.isSubmitting || !password.value) return
  const value = password.value
  clearPassword()
  emit('submit', value)
}

const cancel = () => {
  clearPassword()
  emit('cancel')
}

onUnmounted(clearPassword)
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="submit">
    <div>
      <h2 class="text-lg font-semibold text-gray-900">
        Remover colaborador
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        Esta ação é irreversível.
        {{ employeeName ? `${employeeName} desaparece` : 'O colaborador desaparece' }}
        da lista e o email original fica livre. Um cadastro posterior com esse
        email é uma <span class="font-medium text-gray-500">nova</span> identidade
        e não herda o histórico.
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="remove-actor-password" class="text-sm text-gray-500">
        A sua palavra-passe
      </label>
      <div class="relative">
        <input
          id="remove-actor-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="Palavra-passe"
          :disabled="isSubmitting"
          :aria-invalid="Boolean(errorMessage)"
          :aria-describedby="errorMessage ? 'remove-actor-password-error' : undefined"
          class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-11 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />
        <PasswordRevealler
          v-model="showPassword"
          show-label="Revelar palavra-passe"
          hide-label="Ocultar palavra-passe"
        />
      </div>
      <p
        v-if="errorMessage"
        id="remove-actor-password-error"
        class="text-sm text-red-600"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </div>

    <div class="flex items-center justify-end gap-3 pt-1">
      <button
        type="button"
        class="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        :disabled="isSubmitting"
        @click="cancel"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#d64545] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c13c3c] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isSubmitting || !password"
        :aria-busy="isSubmitting"
      >
        <Icon
          v-if="isSubmitting"
          icon="carbon:circle-dash"
          class="size-4 animate-spin"
        />
        Remover
      </button>
    </div>
  </form>
</template>
