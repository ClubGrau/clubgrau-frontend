<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import logoGrau from '../../assets/img/login-logo-grau.png'
import PasswordInput from '../../components/PasswordInput/PasswordInput.vue'
import { useBreakpoint } from '../../composables/useBreakpoint'
import { useLogin } from '../../composables/useLogin'
import { httpAuthApi } from '../../services/api/auth/http-auth-api'

const { t } = useI18n()
const { isDesktop, isTablet } = useBreakpoint()

const { userCredentials, handleSubmit, isSubmitting } = useLogin(httpAuthApi)
</script>

<template>
  <div
    class="flex w-full"
    :class="
      isDesktop
        ? 'h-dvh'
        : ['min-h-dvh items-center justify-center bg-white py-10', isTablet ? 'px-10' : 'px-6']
    "
  >
    <!-- Branding: desktop only. Tablet and mobile are a single white column. -->
    <div v-if="isDesktop" class="flex w-1/2 items-center justify-center bg-[#092D4D]">
      <div class="flex max-w-md flex-col items-center px-8 text-center">
        <img :src="logoGrau" :alt="t('Login.logoAlt')" class="w-56" />
        <p class="mt-4 whitespace-pre-line text-sm font-light leading-5 tracking-wide text-white">
          {{ t('Login.tagline') }}
        </p>
      </div>
    </div>

    <!-- Form -->
    <div
      class="relative flex flex-col bg-white"
      :class="isDesktop ? 'w-1/2' : 'w-full max-w-md'"
    >
      <div
        class="flex flex-1 items-center justify-center"
        :class="isDesktop ? 'px-16' : ''"
      >
        <div class="w-full" :class="isDesktop ? 'max-w-md' : ''">
          <div :class="isDesktop ? 'mb-10' : 'mb-8 text-center'">
            <img
              v-if="!isDesktop"
              :src="logoGrau"
              :alt="t('Login.logoAlt')"
              class="mx-auto mb-6 w-44"
            />
            <h1
              class="font-bold tracking-tight text-[#092D4D]"
              :class="isDesktop ? 'text-4xl' : 'text-3xl'"
            >
              {{ t('Login.title') }}
            </h1>
            <p class="mt-2 text-sm font-light text-gray-500">
              {{ t('Login.subtitle') }}
            </p>
          </div>

          <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-1.5">
              <label for="email" class="text-sm text-gray-500">{{ t('Login.email') }}</label>
              <input
                id="email"
                v-model="userCredentials.email"
                type="email"
                :placeholder="t('Login.emailPlaceholder')"
                autofocus
                :disabled="isSubmitting"
                class="styled-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <label for="password" class="text-sm text-gray-500">{{ t('Login.password') }}</label>
                <!--
                TODO: Need resolve Resend provider to send email for all domain emails (API).
                <RouterLink to="/forgot-password" class="text-sm text-[#3B82F6] hover:underline">
                  {{ t('Login.forgotPassword') }}
                </RouterLink>-->
              </div>
              <PasswordInput
                id="password"
                v-model="userCredentials.password"
                variant="login"
                autocomplete="current-password"
                :placeholder="t('Login.passwordPlaceholder')"
                :show-label="t('Login.showPassword')"
                :hide-label="t('Login.hidePassword')"
                :disabled="isSubmitting"
              />
            </div>

            <label class="flex cursor-pointer items-center gap-2.5">
              <input
                v-model="userCredentials.remember"
                type="checkbox"
                :disabled="isSubmitting"
                class="size-4 shrink-0 appearance-none rounded-full border border-gray-400 checked:border-[#3B82F6] checked:bg-[#3B82F6] checked:shadow-[inset_0_0_0_3px_white] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <span class="text-sm text-gray-500">
                {{ t('Login.rememberDevice') }}
              </span>
            </label>

            <button
              type="submit"
              class="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#F5A623] py-3.5 text-sm font-semibold text-[#092D4D] transition-colors hover:bg-[#e0981f] disabled:cursor-wait disabled:opacity-60"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
            >
              <Icon
                v-if="isSubmitting"
                icon="carbon:circle-dash"
                class="size-4 animate-spin"
              />
              {{ t('Login.submit') }}
            </button>
          </form>
        </div>
      </div>

      <!-- <footer class="border-t border-gray-100 px-16 py-6">
        politicas a serem definidas pelos domain experts
        <nav class="flex items-center justify-between text-xs font-medium tracking-wide text-[#3B82F6]">
          <a href="#" class="hover:underline">{{ t('Login.privacy') }}</a>
          <a href="#" class="hover:underline">{{ t('Login.terms') }}</a>
          <a href="#" class="hover:underline">{{ t('Login.support') }}</a>
        </nav>
      </footer> -->
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
    disabled:cursor-not-allowed disabled:opacity-60;
}
</style>