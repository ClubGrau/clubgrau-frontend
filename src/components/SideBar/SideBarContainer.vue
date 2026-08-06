<script setup lang="ts">
import SideBarPlugins from "./SideBarPlugins.vue";
import logo from "../../assets/img/app-grau-logo.png";
import { useRouter } from "vue-router";

const router = useRouter();

const navigateToDashboard = () => {
  router.push({ name: "dashboard" });
};
</script>

<template>
  <aside class="w-64 bg-[#101625]">
    <div
      @click="navigateToDashboard"
      class="h-18 flex justify-center items-center cursor-pointer mb-1.25 border-b border-[#6767676f]"
    >
      <img :src="logo" alt="Logo Grau" class="w-4/5" />
    </div>
    <SideBarPlugins />
  </aside>
</template>
