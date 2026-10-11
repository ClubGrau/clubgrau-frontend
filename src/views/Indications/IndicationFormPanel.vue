<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import SelectFilter from '../../components/SelectFilter/SelectFilter.vue';
import {
  indicationOriginNameIssue,
  normalizeIndicationOriginName,
} from '../../domain/indication-origin-name';
import type { Indication } from '../../types/indication';

const props = defineProps<{
  mode: 'create' | 'correct';
  categories: Indication.Category[];
  originName?: string;
  categoryName?: string;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  create: [payload: Indication.CreateOriginCommand];
  correct: [name: string];
}>();

const { t } = useI18n();

const name = ref(props.originName ?? '');
const categoryId = ref('');
const submitted = ref(false);

const nameIssue = computed(() =>
  submitted.value ? indicationOriginNameIssue(name.value) : null,
);
const categoryInvalid = computed(
  () => props.mode === 'create' && submitted.value && !categoryId.value,
);

const categoryOptions = computed(() =>
  props.categories
    .filter((category) => category.holdsOrigins)
    .map((category) => ({
      id: category.id,
      label: category.name,
      value: category.id,
    })),
);

const onSubmit = () => {
  submitted.value = true;
  if (indicationOriginNameIssue(name.value)) return;

  const normalized = normalizeIndicationOriginName(name.value);
  if (props.mode === 'correct') {
    if (normalized === normalizeIndicationOriginName(props.originName ?? '')) {
      emit('close');
      return;
    }
    emit('correct', normalized);
    return;
  }

  if (!categoryId.value) return;
  emit('create', { categoryId: categoryId.value, name: normalized });
};
</script>

<template>
  <div class="flex h-full flex-col bg-[#f7f7f8]">
    <header class="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            {{ t(mode === 'create' ? 'Indications.form.createTitle' : 'Indications.form.correctTitle') }}
          </h2>
          <p class="mt-0.5 text-sm text-gray-400">
            {{
              t(
                mode === 'create'
                  ? 'Indications.form.createSubtitle'
                  : 'Indications.form.correctSubtitle',
              )
            }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          :aria-label="t('Indications.actions.close')"
          @click="emit('close')"
        >
          <Icon icon="carbon:close" class="size-5" />
        </button>
      </div>
    </header>

    <form class="flex min-h-0 flex-1 flex-col" @submit.prevent="onSubmit">
      <div class="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="space-y-4">
            <div v-if="mode === 'create'" class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">{{ t('Indications.form.category') }}</span>
              <div :class="categoryInvalid ? 'rounded-lg ring-2 ring-red-200' : ''">
                <SelectFilter
                  v-model="categoryId"
                  :options="categoryOptions"
                  :placeholder="t('Indications.form.categoryPlaceholder')"
                  variant="field"
                />
              </div>
              <p v-if="categoryInvalid" class="text-sm text-red-500">
                {{ t('Indications.form.missingCategory') }}
              </p>
            </div>

            <div v-else class="flex flex-col gap-1.5">
              <span class="text-xs text-gray-400">{{ t('Indications.form.category') }}</span>
              <p class="text-sm text-gray-800">{{ categoryName }}</p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="indication-origin-name" class="text-xs text-gray-400">
                {{ t('Indications.form.name') }}
              </label>
              <input
                id="indication-origin-name"
                v-model="name"
                type="text"
                class="form-input"
                :class="{ 'form-input-error': nameIssue }"
                :placeholder="t('Indications.form.namePlaceholder')"
              />
              <p v-if="nameIssue" class="text-sm text-red-500">
                {{ t(`Indications.form.${nameIssue}`) }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer class="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-white px-5 py-4">
        <button
          type="button"
          class="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          @click="emit('close')"
        >
          {{ t('Indications.actions.cancel') }}
        </button>
        <button
          type="submit"
          class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e69138] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4822f] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="submitting || (mode === 'create' && categoryOptions.length === 0)"
          :aria-busy="submitting"
        >
          <Icon v-if="submitting" icon="carbon:circle-dash" class="size-4 animate-spin" />
          {{ t(mode === 'create' ? 'Indications.form.createSubmit' : 'Indications.form.correctSubmit') }}
        </button>
      </footer>
    </form>
  </div>
</template>

<style scoped>
@reference "../../style.css";

.form-input {
  @apply w-full rounded-lg border border-gray-200 bg-[#f7f7f8] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#e69138] focus:bg-white focus:ring-2 focus:ring-[#e69138]/20;
}

.form-input-error {
  @apply border-red-300 focus:border-red-400 focus:ring-red-200;
}
</style>
