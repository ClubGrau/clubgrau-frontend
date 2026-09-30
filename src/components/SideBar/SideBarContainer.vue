<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import logo from "../../assets/img/app-grau-logo.png";
import SideBarPlugins from "./SideBarPlugins.vue";

withDefaults(
  defineProps<{
    overlay?: boolean;
  }>(),
  { overlay: false },
);

const emit = defineEmits<{
  navigate: [];
}>();

const { t } = useI18n();
const router = useRouter();

const navigateToDashboard = () => {
  router.push({ name: "dashboard" });
  emit("navigate");
};

const onNavigate = () => {
  emit("navigate");
};
</script>

<template>
  <aside
    id="app-sidebar"
    class="flex w-64 shrink-0 flex-col overflow-y-auto bg-[#101625]"
    v-bind="overlay ? {
      class: 'fixed inset-y-0 left-0 z-50 shadow-xl',
      role: 'dialog',
      'aria-modal': true,
      'aria-label': t('SideBar.menu'),
    } : {
      class: 'h-full',
    }"
  >
    <div
      class="mb-1.25 flex h-18 shrink-0 cursor-pointer items-center justify-center border-b border-[#6767676f]"
      @click="navigateToDashboard"
    >
      <img :src="logo" alt="Logo Grau" class="w-4/5" />
    </div>
    <SideBarPlugins @navigate="onNavigate" />
  </aside>
</template>
