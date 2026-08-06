<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import logoGrau from '../../assets/img/login-logo-grau.png'
import { useLogin } from '../../composables/useLogin'
import { httpAuthApi } from '../../services/api/auth/http-auth-api'
import PasswordRevealler from '../../components/PasswordRevealler.vue'

const { t } = useI18n()

const { userCredentials, handleSubmit } = useLogin(httpAuthApi)
const showPassword = ref(false)
</script>

<template>
  <div class="flex h-screen w-full">
    <!-- Branding -->
    <div class="flex w-1/2 items-center justify-center bg-[#092D4D]">
      <div class="flex max-w-md flex-col items-center px-8 text-center">
        <img :src="logoGrau" :alt="t('Login.logoAlt')" class="w-56" />
        <p class="mt-4 whitespace-pre-line text-sm font-light leading-5 tracking-wide text-white">
          {{ t('Login.tagline') }}
        </p>
      </div>
    </div>

    <!-- Form -->
    <div class="relative flex w-1/2 flex-col bg-white">
      <div class="flex flex-1 items-center justify-center px-16">
        <div class="w-full max-w-md">
          <div class="mb-10">
            <h1 class="text-4xl font-bold tracking-tight text-[#092D4D]">
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
                class="styled-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label for="password" class="text-sm text-gray-500">{{ t('Login.password') }}</label>
                <a href="#" class="text-sm text-[#3B82F6] hover:underline">
                  {{ t('Login.forgotPassword') }}
                </a>
              </div>
              <div class="relative">
                <input
                  id="password"
                  v-model="userCredentials.password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="t('Login.passwordPlaceholder')"
                  class="styled-input"
                />
                <PasswordRevealler
                  v-model="showPassword"
                  :show-label="t('Login.showPassword')"
                  :hide-label="t('Login.hidePassword')"
                />
              </div>
            </div>

            <label class="flex cursor-pointer items-center gap-2.5">
              <input
                v-model="userCredentials.remember"
                type="checkbox"
                class="size-4 shrink-0 appearance-none rounded-full border border-gray-400 checked:border-[#3B82F6] checked:bg-[#3B82F6] checked:shadow-[inset_0_0_0_3px_white]"
              />
              <span class="text-sm text-gray-500">
                {{ t('Login.rememberDevice') }}
              </span>
            </label>

            <button
              type="submit"
              class="mt-2 w-full rounded-lg bg-[#F5A623] py-3.5 text-sm font-semibold text-[#092D4D] transition-colors hover:bg-[#e0981f] cursor-pointer"
            >
              {{ t('Login.submit') }}
            </button>
          </form>
        </div>
      </div>

      <footer class="border-t border-gray-100 px-16 py-6">
        <nav class="flex items-center justify-between text-xs font-medium tracking-wide text-[#3B82F6]">
          <a href="#" class="hover:underline">{{ t('Login.privacy') }}</a>
          <a href="#" class="hover:underline">{{ t('Login.terms') }}</a>
          <a href="#" class="hover:underline">{{ t('Login.support') }}</a>
        </nav>
      </footer>
    </div>
  </div>
</template>

<style scoped>
@reference "../../style.css";

.styled-input {
  @apply w-full 
    rounded-lg border border-transparent 
    bg-gray-100 
    px-4 py-3 pr-11 
    text-sm text-[#092D4D] 
    outline-none 
    placeholder:text-gray-400 
    focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/30;
}
</style>