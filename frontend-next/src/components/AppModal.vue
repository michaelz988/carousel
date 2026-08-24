<script>
/**
 * Stack of currently-open modals, shared across every AppModal instance.
 *
 * Headless UI only closes on Escape while focus sits inside the dialog. When a
 * nested modal (e.g. a confirmation) closes, focus lands back on <body>, and
 * Escape then does nothing — leaving keyboard users trapped in the modal
 * underneath. Tracking the stack lets the topmost modal handle Escape itself,
 * regardless of where focus currently is.
 */
const modalStack = []
</script>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

/**
 * Modal shell built on Headless UI's Dialog, which provides the focus trap,
 * ESC handling, scroll locking and ARIA wiring that the hand-rolled Vue 2
 * modal implemented manually.
 *
 * Emits `close`, matching the event the previous modals emitted, so parent
 * `v-if` + `@close` control flow is unchanged.
 */
defineProps({
  title: { type: String, default: '' },
  size: { type: String, default: 'lg' }, // sm | md | lg | xl
})

const emit = defineEmits(['close'])

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
}

// Identity for this instance's slot in the shared stack.
const token = Symbol('app-modal')

function onKeydown(event) {
  if (event.key !== 'Escape') return
  // Only the topmost modal responds, so Escape peels them off one at a time.
  if (modalStack[modalStack.length - 1] !== token) return
  emit('close')
}

onMounted(() => {
  modalStack.push(token)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  const i = modalStack.indexOf(token)
  if (i !== -1) modalStack.splice(i, 1)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <TransitionRoot appear :show="true" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-ink-900/50 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-start justify-center p-4 sm:p-6">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="my-auto flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-overlay"
              :class="sizes[size] ?? sizes.lg"
            >
              <header
                class="flex items-center justify-between gap-4 border-b border-ink-200 px-6 py-4"
              >
                <DialogTitle
                  class="font-display text-lg font-semibold text-ink-900"
                >
                  <slot name="title">{{ title }}</slot>
                </DialogTitle>
                <button
                  type="button"
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
                  aria-label="Close"
                  @click="emit('close')"
                >
                  <XMarkIcon class="h-5 w-5" />
                </button>
              </header>

              <div class="max-h-[75vh] overflow-y-auto px-6 py-5">
                <slot />
              </div>

              <footer
                v-if="$slots.footer"
                class="flex justify-end gap-2 border-t border-ink-200 px-6 py-4"
              >
                <slot name="footer" />
              </footer>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
