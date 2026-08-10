<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div
    class="rounded-xl border border-dashed border-ink-300 bg-white/60 px-6 py-14 text-center"
  >
    <p class="font-display text-lg font-medium text-ink-700">{{ title }}</p>
    <p v-if="description" class="mx-auto mt-2 max-w-sm text-sm text-ink-500">
      {{ description }}
    </p>
    <div class="mt-5"><slot /></div>
  </div>
</template>
