<script setup lang="ts">
import TemplateDefault from './TemplateDefault.vue';
import SideBarContainer from '../components/SideBar/SideBarContainer.vue';
import UserAvatar from '../components/UserAvatar/UserAvatar.vue';
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[#f5f5f7]">
    <SideBarContainer />
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header
        class="flex h-18 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-8"
      >
        <div class="flex items-center gap-3">
          <UserAvatar initials="GU" size="md" alt="Grau usuário" />
          <div class="leading-tight">
            <p class="text-sm font-semibold text-gray-900">Grau usuário</p>
            <p class="text-xs text-gray-400">Administrador</p>
          </div>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto">
        <TemplateDefault />
      </main>
    </div>
  </div>
</template>
