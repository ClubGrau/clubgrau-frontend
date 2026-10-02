<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type CSSProperties } from 'vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import patchLogo from '../assets/img/patch-logo.png';
import Drawer from '../components/Drawer/Drawer.vue';
import OwnEmployeeDataForm from '../components/ProfileCard/OwnEmployeeDataForm.vue';
import ProfileCard from '../components/ProfileCard/ProfileCard.vue';
import SideBarContainer from '../components/SideBar/SideBarContainer.vue';
import UserAvatar from '../components/UserAvatar/UserAvatar.vue';
import { employeeStatusBadge } from '../constants/employee-status';
import { useOwnEmployeeScreen } from '../composables/own-employee/useOwnEmployeeScreen';
import { useBreakpoint } from '../composables/useBreakpoint';
import { actorInitials, ROLE_LABEL } from '../domain/actor-display';
import { useAuthStore } from '../stores/auth';
import TemplateDefault from './TemplateDefault.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { isMobile } = useBreakpoint();
const menuOpen = ref(false);
const profileOpen = ref(false);
const profileTrigger = ref<HTMLElement | null>(null);
const profileCardStyle = ref<CSSProperties>({});

const authStore = useAuthStore();
const {
  isFormOpen,
  employee: ownEmployee,
  isLoadError: isOwnEmployeeLoadError,
  isSaving: isSavingOwnEmployee,
  openForm,
  closeForm,
  retryLoad,
  save: saveOwnEmployee,
} = useOwnEmployeeScreen();
const actor = computed(() => authStore.actor);
const displayName = computed(() => actor.value?.name?.trim() || '...');
const displayEmail = computed(() => actor.value?.email?.trim() || '');
const roleLabel = computed(() => {
  const role = actor.value?.role;
  return role ? ROLE_LABEL[role] : '';
});
const initials = computed(() => actorInitials(actor.value?.name ?? null));
const statusPresentation = computed(() => {
  const status = actor.value?.status;
  return status ? employeeStatusBadge[status] : null;
});

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const positionProfileCard = () => {
  const trigger = profileTrigger.value;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  profileCardStyle.value = {
    top: `${rect.bottom + 8}px`,
    right: `${Math.max(window.innerWidth - rect.right, 16)}px`,
  };
};

const closeProfile = () => {
  profileOpen.value = false;
};

const toggleProfile = () => {
  profileOpen.value = !profileOpen.value;
  if (profileOpen.value) positionProfileCard();
};

const onUpdateProfile = () => {
  closeProfile();
  closeMenu();
  openForm();
};

const onLogout = () => {
  closeProfile();
  authStore.logout();
  void router.push('/login');
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  if (profileOpen.value) closeProfile();
  if (menuOpen.value) closeMenu();
};

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target?.closest('[data-profile-menu]')) closeProfile();
};

const onViewportChange = () => {
  if (profileOpen.value) closeProfile();
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onDocumentClick);
  window.addEventListener('resize', onViewportChange);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.removeEventListener('click', onDocumentClick);
  window.removeEventListener('resize', onViewportChange);
});

watch(isMobile, (mobile) => {
  if (!mobile) closeMenu();
});

watch(() => route.path, () => {
  closeMenu();
  closeProfile();
  closeForm();
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

        <div data-profile-menu class="min-w-0">
          <button
            ref="profileTrigger"
            type="button"
            class="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-gray-50"
            :aria-expanded="profileOpen"
            aria-haspopup="dialog"
            aria-controls="profile-card"
            @click="toggleProfile"
          >
            <UserAvatar :initials="initials" size="md" :alt="displayName" />
            <div class="min-w-0 leading-tight">
              <p class="truncate text-sm font-semibold text-gray-900">{{ displayName }}</p>
              <p class="truncate text-xs text-gray-400">{{ roleLabel }}</p>
            </div>
            <Icon
              icon="carbon:chevron-down"
              class="size-4 shrink-0 text-gray-400 transition-transform"
              :class="profileOpen ? 'rotate-180' : ''"
            />
          </button>
        </div>
      </header>

      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="translate-y-1 opacity-0"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="translate-y-1 opacity-0"
        >
          <ProfileCard
            v-if="profileOpen"
            class="fixed z-60"
            :style="profileCardStyle"
            :name="displayName"
            :email="displayEmail"
            :initials="initials"
            :role-label="roleLabel"
            :status-label="statusPresentation?.label"
            :status-variant="statusPresentation?.variant"
            @update="onUpdateProfile"
            @logout="onLogout"
          />
        </Transition>
      </Teleport>
      <main class="flex-1 overflow-y-auto">
        <TemplateDefault />
      </main>

      <Drawer :open="isFormOpen" width-class="w-full max-w-3xl" @close="closeForm">
        <OwnEmployeeDataForm
          v-if="isFormOpen"
          :employee="ownEmployee"
          :load-failed="isOwnEmployeeLoadError"
          :submitting="isSavingOwnEmployee"
          @close="closeForm"
          @retry="retryLoad"
          @save="saveOwnEmployee"
        />
      </Drawer>
    </div>
  </div>
</template>
