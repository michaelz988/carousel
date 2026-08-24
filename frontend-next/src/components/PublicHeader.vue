<script setup>
import CarouselMark from '@/components/CarouselMark.vue'

defineProps({ showLogin: { type: Boolean, default: true } })
const emit = defineEmits(['login'])
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-6">
      <RouterLink to="/" class="flex items-center gap-2.5 text-brand-600">
        <CarouselMark :size="34" />
        <span class="font-display text-xl font-semibold text-brand-700">
          Carousel
        </span>
      </RouterLink>

      <button
        v-if="showLogin"
        type="button"
        class="ml-auto rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        @click="emit('login')"
      >
        Log in
      </button>
    </div>
  </header>
</template>
