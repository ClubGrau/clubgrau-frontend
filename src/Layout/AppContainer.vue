<script setup lang="ts">
import { computed } from 'vue';
import TemplateDefault from './TemplateDefault.vue';
import SideBarContainer from '../components/SideBar/SideBarContainer.vue';
import UserAvatar from '../components/UserAvatar/UserAvatar.vue';
import ToastHost from '../components/Toast/ToastHost.vue';
import { useAuthStore } from '../stores/auth';
import { actorInitials, ROLE_LABEL } from '../domain/actor-display';

const authStore = useAuthStore();
const actor = computed(() => authStore.actor);
const displayName = computed(() => actor.value?.name ?? '—');
const roleLabel = computed(() => {
  const role = actor.value?.role;
  return role ? ROLE_LABEL[role] : '';
});
const initials = computed(() => actorInitials(actor.value?.name ?? null));
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[#f5f5f7]">
    <SideBarContainer />
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header
        class="flex h-18 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-8"
      >
        <div class="flex items-center gap-3">
          <UserAvatar :initials="initials" size="md" :alt="displayName" />
          <div class="leading-tight">
            <p class="text-sm font-semibold text-gray-900">{{ displayName }}</p>
            <p class="text-xs text-gray-400">{{ roleLabel }}</p>
          </div>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto">
        <TemplateDefault />
      </main>
    </div>
    <ToastHost />
  </div>
</template>
