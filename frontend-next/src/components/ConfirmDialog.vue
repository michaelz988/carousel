<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'

/**
 * Replaces `window.confirm` for destructive lottery actions.
 *
 * The native dialog could only carry one line of text, which is not enough for
 * an action like reopening a lottery — that clears every assignment, and
 * students may already have been told which POAS they received.
 */
defineProps({
  title: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  variant: { type: String, default: 'danger' }, // danger | primary
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <AppModal size="sm" :title="title" @close="emit('cancel')">
    <div class="flex gap-3">
      <span
        class="grid h-9 w-9 shrink-0 place-items-center rounded-full"
        :class="
          variant === 'danger'
            ? 'bg-red-50 text-red-600'
            : 'bg-brand-50 text-brand-700'
        "
        aria-hidden="true"
      >
        <ExclamationTriangleIcon class="h-5 w-5" />
      </span>
      <div class="text-sm leading-relaxed text-ink-600">
        <slot />
      </div>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="emit('cancel')">
        {{ cancelLabel }}
      </AppButton>
      <AppButton
        :variant="variant === 'danger' ? 'danger' : 'primary'"
        :disabled="busy"
        @click="emit('confirm')"
      >
        {{ busy ? 'Working…' : confirmLabel }}
      </AppButton>
    </template>
  </AppModal>
</template>
