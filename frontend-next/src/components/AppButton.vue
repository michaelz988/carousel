<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger
  size: { type: String, default: 'md' }, // sm | md
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary:
    'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 hover:border-ink-300',
  ghost: 'text-brand-700 hover:bg-brand-50',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

const classes = computed(
  () => `${base} ${variants[props.variant] ?? variants.primary} ${sizes[props.size] ?? sizes.md}`,
)
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
