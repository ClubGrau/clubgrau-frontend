<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import Drawer from '../../components/Drawer/Drawer.vue';
import PageHeader from '../../components/PageHeader/PageHeader.vue';
import StatusBadge from '../../components/StatusBadge/StatusBadge.vue';
import PageContainer from '../../Layout/PageContainer.vue';
import { useIndicationsScreen } from '../../composables/indications/useIndicationsScreen';
import type { BreadcrumbItem } from '../../types/breadcrumb';
import IndicationFormPanel from './IndicationFormPanel.vue';

const { t } = useI18n();

const {
  categories,
  isLoading,
  catalogErrorKey,
  editor,
  correcting,
  isCreatingOrigin,
  isCorrectingName,
  isEnding,
  isReopening,
  openCreate,
  openCorrect,
  closeEditor,
  createOrigin,
  correctName,
  end,
  reopen,
} = useIndicationsScreen();

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { id: 'dashboard', label: t('Indications.breadcrumb.dashboard'), to: '/app/dashboard' },
  { id: 'indications', label: t('Indications.breadcrumb.indications') },
]);

const collapsedGroups = ref<Record<string, boolean>>({});

const isGroupOpen = (id: string) => collapsedGroups.value[id] !== true;

const toggleGroup = (id: string) => {
  collapsedGroups.value = {
    ...collapsedGroups.value,
    [id]: isGroupOpen(id),
  };
};

const groupToggleLabel = (id: string, name: string) =>
  t(isGroupOpen(id) ? 'Indications.group.collapse' : 'Indications.group.expand', { name });

const groupCountLabel = (count: number) => {
  if (count === 0) return t('Indications.group.none');
  return t(count === 1 ? 'Indications.group.one' : 'Indications.group.many', { count });
};

const submitting = computed(() =>
  editor.value === 'correct' ? isCorrectingName.value : isCreatingOrigin.value,
);
</script>

<template>
  <PageContainer>
    <Breadcrumb :items="breadcrumbItems" />

    <PageHeader :title="t('Indications.title')" :subtitle="t('Indications.subtitle')">
      <template #actions>
        <button
          type="button"
          class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f] sm:w-auto"
          @click="openCreate"
        >
          {{ t('Indications.newOrigin') }}
          <span class="text-lg leading-none">+</span>
        </button>
      </template>
    </PageHeader>

    <section
      v-if="isLoading"
      class="space-y-4"
      aria-busy="true"
      :aria-label="t('Indications.loading')"
    >
      <p class="flex items-center gap-2 text-sm text-gray-400">
        <Icon icon="carbon:circle-dash" class="size-4 animate-spin text-[#e69138]" />
        {{ t('Indications.loading') }}
      </p>
      <div
        v-for="group in 3"
        :key="group"
        class="overflow-hidden rounded-2xl bg-white shadow-sm"
      >
        <div class="flex items-center justify-between px-5 py-4">
          <div class="h-4 w-32 animate-pulse rounded bg-gray-100" />
          <div class="h-3 w-16 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </section>

    <p
      v-else-if="catalogErrorKey"
      class="rounded-2xl bg-white px-5 py-10 text-center text-sm text-gray-500 shadow-sm"
    >
      {{ t(catalogErrorKey) }}
    </p>

    <div v-else class="space-y-4">
      <section
        v-for="group in categories"
        :key="group.id"
        class="overflow-hidden rounded-2xl bg-white shadow-sm"
      >
        <h2 class="text-base font-semibold text-gray-900">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left"
            :aria-expanded="isGroupOpen(group.id)"
            :aria-controls="`indication-group-${group.id}`"
            :aria-label="groupToggleLabel(group.id, group.name)"
            @click="toggleGroup(group.id)"
          >
            <span>{{ group.name }}</span>
            <span class="flex items-center gap-3">
              <span v-if="group.holdsOrigins" class="text-xs font-normal text-gray-400">
                {{ groupCountLabel(group.origins.length) }}
              </span>
              <Icon
                icon="carbon:chevron-down"
                class="size-4 text-gray-400 transition-transform"
                :class="isGroupOpen(group.id) ? 'rotate-180' : undefined"
              />
            </span>
          </button>
        </h2>

        <div v-show="isGroupOpen(group.id)" :id="`indication-group-${group.id}`">
          <p
            v-if="!group.holdsOrigins"
            class="border-t border-gray-100 px-5 py-6 text-sm text-gray-400"
          >
            {{ t('Indications.group.friendEmpty') }}
          </p>
          <p
            v-else-if="group.origins.length === 0"
            class="border-t border-gray-100 px-5 py-6 text-sm text-gray-400"
          >
            {{ t('Indications.group.empty') }}
          </p>

          <article
            v-for="origin in group.origins"
            :key="origin.id"
            class="border-t border-gray-100 px-3 py-1.5 sm:px-4"
          >
            <div class="flex items-center gap-4">
              <span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                {{ origin.name }}
              </span>
              <StatusBadge
                class="w-[5.75rem] shrink-0 justify-center"
                :label="t(origin.active ? 'Indications.status.active' : 'Indications.status.ended')"
                :variant="origin.active ? 'success' : 'warning'"
                size="sm"
              />

              <div class="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  class="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  @click="openCorrect(origin.id)"
                >
                  {{ t('Indications.menu.correct') }}
                </button>
                <button
                  v-if="origin.active"
                  type="button"
                  class="w-[5.75rem] cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap text-gray-800 transition-colors hover:bg-gray-100 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isEnding"
                  @click="end(origin.id)"
                >
                  {{ t('Indications.menu.end') }}
                </button>
                <button
                  v-else
                  type="button"
                  class="w-[5.75rem] cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap text-[#c47a12] transition-colors hover:bg-[#fff4e5] hover:text-[#9a5c10] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isReopening"
                  @click="reopen(origin.id)"
                >
                  {{ t('Indications.menu.reopen') }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <Drawer :open="editor !== null" @close="closeEditor">
      <IndicationFormPanel
        v-if="editor === 'create'"
        key="create"
        mode="create"
        :categories="categories"
        :submitting="submitting"
        @close="closeEditor"
        @create="createOrigin"
      />
      <IndicationFormPanel
        v-else-if="editor === 'correct' && correcting"
        :key="correcting.origin.id"
        mode="correct"
        :categories="categories"
        :origin-name="correcting.origin.name"
        :category-name="correcting.categoryName"
        :submitting="submitting"
        @close="closeEditor"
        @correct="correctName({ id: correcting.origin.id, name: $event })"
      />
    </Drawer>
  </PageContainer>
</template>
