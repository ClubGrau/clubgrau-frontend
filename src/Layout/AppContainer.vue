<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import patchLogo from '../assets/img/patch-logo.png';
import SideBarContainer from '../components/SideBar/SideBarContainer.vue';
import UserAvatar from '../components/UserAvatar/UserAvatar.vue';
import { useBreakpoint } from '../composables/useBreakpoint';
import { actorInitials, ROLE_LABEL } from '../domain/actor-display';
import { useAuthStore } from '../stores/auth';
import TemplateDefault from './TemplateDefault.vue';

const { t } = useI18n();
const route = useRoute();
const { isMobile } = useBreakpoint();
const menuOpen = ref(false);

const authStore = useAuthStore();
const actor = computed(() => authStore.actor);
const displayName = computed(() => actor.value?.name ?? '—');
const roleLabel = computed(() => {
  const role = actor.value?.role;
  return role ? ROLE_LABEL[role] : '';
});
const initials = computed(() => actorInitials(actor.value?.name ?? null));

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && menuOpen.value) closeMenu();
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});

watch(isMobile, (mobile) => {
  if (!mobile) closeMenu();
});

watch(() => route.path, () => {
  closeMenu();
});
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[#f5f5f7]">
    <SideBarContainer v-if="!isMobile" />

    <template v-else>
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="menuOpen"
          class="fixed inset-0 z-40 bg-black/40"
          aria-hidden="true"
          @click="closeMenu"
        />
      </Transition>

      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="-translate-x-full"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-to-class="-translate-x-full"
      >
        <SideBarContainer v-if="menuOpen" overlay @navigate="closeMenu" />
      </Transition>
    </template>

    <div
      class="flex min-w-0 flex-1 flex-col overflow-hidden"
      :inert="isMobile && menuOpen ? true : undefined"
    >
      <header
        class="flex h-18 shrink-0 items-center border-b border-gray-200 bg-white"
        :class="isMobile ? 'justify-between gap-3 px-4' : 'justify-end px-8'"
      >
        <button
          v-if="isMobile"
          type="button"
          class="inline-flex h-18 shrink-0 cursor-pointer items-center justify-center rounded-xl"
          :aria-expanded="menuOpen"
          aria-controls="app-sidebar"
          :aria-label="menuOpen ? t('SideBar.closeMenu') : t('SideBar.openMenu')"
          @click="toggleMenu"
        >
          <img :src="patchLogo" alt="" class="size-10" />
          <Icon icon="mdi:menu" class="size-8 shrink-0" />
        </button>

        <div class="flex min-w-0 items-center gap-3">
          <UserAvatar :initials="initials" size="md" :alt="displayName" />
          <div class="min-w-0 leading-tight">
            <p class="truncate text-sm font-semibold text-gray-900">{{ displayName }}</p>
            <p class="truncate text-xs text-gray-400">{{ roleLabel }}</p>
          </div>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto">
        <TemplateDefault />
      </main>
    </div>
  </div>
</template>
