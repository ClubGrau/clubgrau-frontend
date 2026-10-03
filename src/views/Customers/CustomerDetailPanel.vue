<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import UserAvatar from '../../components/UserAvatar/UserAvatar.vue';
import { formatRegistrationDate } from '../../domain/customer-wallet';
import { useToast } from '../../composables/useToast';
import type { Customer } from '../../types/customer';
import RankPatch from './RankPatch.vue';

const props = defineProps<{
  customer: Customer.ListItem;
}>();

const emit = defineEmits<{
  close: [];
  openCustomer: [id: string];
  remove: [];
}>();

const { t } = useI18n();
const toast = useToast();

const copyNif = async () => {
  try {
    await navigator.clipboard.writeText(props.customer.nif);
    toast.push('success', t('Customers.toast.nifCopied'));
  } catch {
    toast.push('error', t('Customers.toast.unexpected'));
  }
};
</script>

<template>
  <div class="flex h-full flex-col bg-[#f7f7f8]">
    <header class="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <UserAvatar
            :initials="customer.initials"
            size="sm"
            :alt="customer.name"
          />
          <div class="min-w-0">
            <h2 class="truncate text-lg font-semibold text-gray-900">
              {{ customer.name }}
            </h2>
            <div class="mt-1">
              <RankPatch v-if="customer.rank" variant="table" :rank="customer.rank" />
              <span v-else class="text-sm text-gray-400">{{ t('Customers.emptyValue') }}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          :aria-label="t('Customers.actions.close')"
          @click="emit('close')"
        >
          <Icon icon="carbon:close" class="size-5" />
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto px-5 py-5">
      <dl class="space-y-4 rounded-2xl bg-white p-4">
        <div>
          <dt class="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
            {{ t('Customers.table.contact') }}
          </dt>
          <dd class="mt-1 space-y-1 text-sm text-gray-800">
            <p>{{ customer.email }}</p>
            <p>{{ customer.phone }}</p>
          </dd>
        </div>

        <div>
          <dt class="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
            {{ t('Customers.table.nif') }}
          </dt>
          <dd class="mt-1 text-sm text-gray-800">
            <div v-if="customer.nif.trim()" class="flex items-center gap-2">
              <span>{{ customer.nif }}</span>
              <button
                type="button"
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                :aria-label="t('Customers.nif.copy')"
                @click="copyNif"
              >
                <Icon icon="carbon:copy" class="size-3.5" />
              </button>
            </div>
            <span v-else class="text-gray-400">{{ t('Customers.emptyValue') }}</span>
          </dd>
        </div>

        <div>
          <dt class="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
            {{ t('Customers.table.registeredAt') }}
          </dt>
          <dd class="mt-1 text-sm text-gray-800">
            {{ formatRegistrationDate(customer.createdAt) }}
          </dd>
        </div>

        <div>
          <dt class="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
            {{ t('Customers.table.referral') }}
          </dt>
          <dd class="mt-1 text-sm text-gray-800">
            <button
              v-if="customer.referralCustomerId"
              type="button"
              class="cursor-pointer font-medium text-gray-900 underline-offset-2 hover:underline"
              :aria-label="t('Customers.referral.open', { name: customer.referral })"
              @click="emit('openCustomer', customer.referralCustomerId)"
            >
              {{ customer.referral }}
            </button>
            <span v-else>{{ customer.referral.trim() || t('Customers.emptyValue') }}</span>
            <p v-if="customer.referredCount > 0" class="mt-1 text-xs text-gray-500">
              {{ t('Customers.referral.referred', { count: customer.referredCount }) }}
            </p>
          </dd>
        </div>
      </dl>
    </div>

    <footer class="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        @click="emit('remove')"
      >
        <Icon icon="carbon:trash-can" class="size-4" />
        {{ t('Customers.actions.remove') }}
      </button>
    </footer>
  </div>
</template>
