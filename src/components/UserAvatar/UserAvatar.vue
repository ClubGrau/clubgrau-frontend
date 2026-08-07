<script setup lang="ts">
import type { UserAvatarSize } from '../../types/user-avatar';

interface UserAvatarProps {
  initials: string;
  size?: UserAvatarSize;
  alt?: string;
  src?: string;
}

withDefaults(
  defineProps<UserAvatarProps>(),
  {
    size: 'md',
    alt: 'Avatar',
  },
);

const sizeClasses: Record<UserAvatarSize, string> = {
  sm: 'size-9 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-lg',
};
</script>

<template>
  <div
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1a2332] font-semibold text-white"
    :class="sizeClasses[size]"
    :aria-label="alt"
    role="img"
  >
    <slot :initials="initials" :src="src">
      <img
        v-if="src"
        :src
        :alt
        class="size-full object-cover"
      />
      <span v-else>{{ initials }}</span>
    </slot>
  </div>
</template>
