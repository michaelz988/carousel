<script setup>
import { toasts, dismiss } from '@/lib/notify'
import { XMarkIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border px-4 py-3 shadow-raised"
        :class="
          t.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-900'
            : 'border-ink-200 bg-white text-ink-900'
        "
      >
        <p class="flex-1 text-sm">{{ t.message }}</p>
        <button
          type="button"
          class="rounded p-0.5 opacity-60 transition hover:opacity-100"
          aria-label="Dismiss"
          @click="dismiss(t.id)"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
