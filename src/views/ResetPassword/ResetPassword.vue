<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import logoGrau from '../../assets/img/login-logo-grau.png'
import BlockingAlertModal from '../../components/Modal/BlockingAlertModal.vue'
import PasswordInput from '../../components/PasswordInput/PasswordInput.vue'
import { useResetPasswordScreen } from '../../composables/auth/useResetPasswordScreen'

const { t } = useI18n()
const route = useRoute()

const token = computed(() => {
  const value = route.query.token
  return typeof value === 'string' ? value : undefined
})

const {
  password,
  passwordConfirmation,
  generatePassword,
  handleSubmit,
  hasToken,
  isResetting,
} = useResetPasswordScreen(token)
</script>

<template>
  <div class="relative min-h-screen bg-white">
    <BlockingAlertModal
      :open="!hasToken"
      :title="t('ResetPassword.missingTokenTitle')"
      :description="t('ResetPassword.missingToken')"
    >
      <template #actions>
        <RouterLink
          to="/forgot-password"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#F5A623] px-4 py-3 text-sm font-semibold text-[#092D4D] transition-colors hover:bg-[#e0981f]"
        >
          {{ t('ResetPassword.requestNewLink') }}
        </RouterLink>
        <RouterLink
          to="/login"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#092D4D] transition-colors hover:bg-gray-50"
        >
          {{ t('ResetPassword.backToLogin') }}
        </RouterLink>
      </template>
    </BlockingAlertModal>

    <div class="flex min-h-screen items-center justify-center px-6 py-10">
      <div class="w-full max-w-105" :inert="!hasToken || undefined">
        <div class="mb-10 text-center">
          <img :src="logoGrau" :alt="t('Login.logoAlt')" class="mx-auto mb-6 w-44" />
          <h1 class="text-2xl font-bold tracking-tight text-[#092D4D]">
            {{ t('ResetPassword.title') }}
          </h1>
          <p class="mx-auto mt-3 max-w-sm text-sm font-light leading-5 text-gray-500">
            {{ t('ResetPassword.subtitle') }}
          </p>
        </div>

        <section class="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-5">
          <h2 class="text-base font-semibold text-[#092D4D]">
            {{ t('ResetPassword.generateTitle') }}
          </h2>
          <p class="mt-1 text-sm font-light text-gray-500">
            {{ t('ResetPassword.generateDescription') }}
          </p>
          <button
            type="button"
            :disabled="!hasToken || isResetting"
            class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#F5A623] bg-white px-4 py-2.5 text-sm font-medium text-[#092D4D] transition-colors hover:bg-[#FFF7E8] disabled:cursor-not-allowed disabled:opacity-60"
            @click="generatePassword"
          >
            <Icon icon="carbon:magic-wand" class="size-4 text-[#F5A623]" />
            {{ t('ResetPassword.generateButton') }}
          </button>
        </section>

        <form
          class="rounded-xl border border-gray-100 bg-gray-50 p-5"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <h2 class="text-base font-semibold text-[#092D4D]">
            {{ t('ResetPassword.customTitle') }}
          </h2>
          <p class="mt-1 text-sm font-light text-gray-500">
            {{ t('ResetPassword.customDescription') }}
          </p>

          <div class="mt-5 flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label for="new-password" class="text-sm text-gray-500">
                {{ t('ResetPassword.newPassword') }}
              </label>
              <PasswordInput
                id="new-password"
                v-model="password"
                variant="login"
                autocomplete="new-password"
                :placeholder="t('ResetPassword.newPasswordPlaceholder')"
                :show-label="t('ResetPassword.showPassword')"
                :hide-label="t('ResetPassword.hidePassword')"
                :disabled="!hasToken || isResetting"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="confirm-password" class="text-sm text-gray-500">
                {{ t('ResetPassword.confirmPassword') }}
              </label>
              <PasswordInput
                id="confirm-password"
                v-model="passwordConfirmation"
                variant="login"
                autocomplete="new-password"
                :placeholder="t('ResetPassword.confirmPasswordPlaceholder')"
                :show-label="t('ResetPassword.showPassword')"
                :hide-label="t('ResetPassword.hidePassword')"
                :disabled="!hasToken || isResetting"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="!hasToken || isResetting"
            class="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#F5A623] py-3.5 text-sm font-semibold text-[#092D4D] transition-colors hover:bg-[#e0981f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon icon="carbon:security" class="size-4" />
            {{ t('ResetPassword.submit') }}
          </button>
        </form>

        <RouterLink
          to="/login"
          class="mt-5 block text-center text-sm text-[#3B82F6] underline hover:text-[#2563EB]"
        >
          {{ t('ResetPassword.backToLogin') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>
