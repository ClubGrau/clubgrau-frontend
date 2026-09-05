<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import logoGrau from '../../assets/img/login-logo-grau.png'
import { useForgotPasswordScreen } from '../../composables/auth/useForgotPasswordScreen'

const { t } = useI18n()
const { email, handleSubmit, isSending } = useForgotPasswordScreen()
</script>

<template>
  <div class="relative min-h-screen bg-white">
    <div class="flex min-h-screen items-center justify-center px-6">
      <div class="w-full max-w-105">
        <div class="mb-10 text-center">
          <img :src="logoGrau" :alt="t('Login.logoAlt')" class="mx-auto mb-6 w-44" />
          <h1 class="text-3xl font-bold tracking-tight text-[#092D4D]">
            {{ t('ForgotPassword.title') }}
          </h1>
          <p class="mx-auto mt-3 max-w-sm text-sm font-light leading-5 text-gray-500">
            {{ t('ForgotPassword.subtitle') }}
          </p>
        </div>

        <form class="flex flex-col" novalidate @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-1.5">
            <label for="email" class="text-sm text-gray-500">
              {{ t('ForgotPassword.email') }}
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              :placeholder="t('ForgotPassword.emailPlaceholder')"
              autocomplete="email"
              autofocus
              :disabled="isSending"
              class="styled-input"
            />
          </div>

          <button
            type="submit"
            :disabled="isSending"
            class="mt-8 w-full cursor-pointer rounded-lg bg-[#F5A623] py-3.5 text-sm font-semibold text-[#092D4D] transition-colors hover:bg-[#e0981f] disabled:cursor-wait disabled:opacity-60"
          >
            {{ t('ForgotPassword.submit') }}
          </button>

          <RouterLink
            to="/login"
            class="mt-5 text-center text-sm text-[#3B82F6] underline hover:text-[#2563EB]"
          >
            {{ t('ForgotPassword.backToLogin') }}
          </RouterLink>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../../style.css";

.styled-input {
  @apply w-full
    rounded-lg border border-transparent
    bg-gray-100
    px-4 py-3
    text-sm text-[#092D4D]
    outline-none
    placeholder:text-gray-400
    focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/30
    disabled:cursor-wait disabled:opacity-60;
}
</style>
