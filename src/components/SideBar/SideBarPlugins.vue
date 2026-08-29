<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { navigationSections } from "../../routes/navigation-paths";
import { useRoute } from "vue-router";
import { useRouterOptions } from "../../composables/useRouterOptions";
import { useAuthStore } from "../../stores/auth";
import { canAccessEmployees } from "../../domain/actor-display";
import type { NavigatePathsProps } from "../../types/navigation";

const router = useRoute();
const { matchedRouter } = useRouterOptions();
const authStore = useAuthStore();
const actor = computed(() => authStore.actor);

const visibleSections = computed(() =>
  navigationSections.map((section) => ({
    ...section,
    items: section.items.filter((item) => isNavItemVisible(item)),
  })),
);

function isNavItemVisible(item: NavigatePathsProps) {
  if (!item.roles) {
    return true;
  }
  return canAccessEmployees(actor.value);
}

const isRouteActive = (route: string) => {
  return router.path === route || matchedRouter(route);
};
</script>

<template>
  <nav class="px-4 py-3">
    <div
      v-for="section in visibleSections"
      :key="section.id"
      class="mb-5 last:mb-0"
    >
      <p
        class="mb-2 px-4 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase"
      >
        {{ section.title }}
      </p>

      <ul>
        <li
          v-for="link in section.items"
          :key="link.id"
          :class="[
            'my-0.5 rounded-xl text-base transition-all duration-300 ease-in-out',
            isRouteActive(link.router)
              ? 'bg-[#335C65] text-[#EAEAEA]'
              : 'hover:cursor-pointer hover:bg-[#182b30] hover:text-white',
          ]"
        >
          <router-link
            :to="{ path: link.router }"
            class="flex items-center justify-start px-4 py-2.5"
          >
            <Icon :icon="link.icon" class="mr-2.5 h-5 w-5 text-white" />
            <span class="text-[15px] text-white">{{ link.description }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>
