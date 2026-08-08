<script setup lang="ts">
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import type { BreadcrumbItem } from '../../types/breadcrumb';

const breadcrumbItems: BreadcrumbItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
];

</script>

<template>
  <div class="min-h-full bg-[#f5f5f7] px-8 pb-8 pt-5">
    <Breadcrumb :items="breadcrumbItems" />
    <h1>Dashboard</h1>
  </div>
</template>