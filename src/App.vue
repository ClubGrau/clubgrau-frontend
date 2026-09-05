<script setup lang="ts">
import ToastHost from './components/Toast/ToastHost.vue'
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition name="page" mode="out-in">
      <component :is="Component" :key="route.matched[0]?.path ?? route.path" />
    </transition>
  </router-view>
  <ToastHost />
</template>
