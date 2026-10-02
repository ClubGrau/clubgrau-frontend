<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import StatusBadge from '../StatusBadge/StatusBadge.vue';
import UserAvatar from '../UserAvatar/UserAvatar.vue';
import type { StatusBadgeVariant } from '../../types/status-badge';

interface ProfileCardProps {
  name: string;
  email: string;
  initials: string;
  roleLabel: string;
  statusLabel?: string | null;
  statusVariant?: StatusBadgeVariant | null;
}

defineProps<ProfileCardProps>();

const emit = defineEmits<{
  update: [];
  logout: [];
}>();

const { t } = useI18n();
</script>

<template>
  <section
    id="profile-card"
    data-profile-menu
    role="dialog"
    :aria-label="t('ProfileCard.title')"
    class="w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_12px_32px_rgba(16,22,37,0.12)]"
  >
    <div class="flex items-start gap-4 px-5 pt-5 pb-4">
      <UserAvatar :initials="initials" size="lg" :alt="name" />
      <div class="min-w-0 flex-1 pt-0.5">
        <p class="truncate text-base font-semibold text-gray-900">{{ name }}</p>
        <p class="mt-0.5 truncate text-sm text-gray-400">
          {{ roleLabel || t('ProfileCard.empty') }}
        </p>
        <StatusBadge
          v-if="statusLabel && statusVariant"
          class="mt-2"
          :label="statusLabel"
          :variant="statusVariant"
          size="sm"
        />
        <p class="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-gray-700">
          <Icon icon="carbon:email" class="size-4 shrink-0 text-gray-400" />
          <span class="truncate">{{ email || t('ProfileCard.empty') }}</span>
        </p>
      </div>
    </div>

    <div class="border-t border-gray-100 p-2">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="emit('update')"
      >
        <Icon icon="carbon:edit" class="size-4 shrink-0 text-gray-400" />
        {{ t('ProfileCard.update') }}
      </button>
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="emit('logout')"
      >
        <Icon icon="carbon:logout" class="size-4 shrink-0 text-gray-400" />
        {{ t('ProfileCard.logout') }}
      </button>
    </div>
  </section>
</template>
