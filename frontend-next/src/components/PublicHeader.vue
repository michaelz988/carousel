<script setup>
import logoUrl from '@/assets/logo.png'

defineProps({ showLogin: { type: Boolean, default: true } })
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-6">
      <RouterLink to="/" class="flex items-center gap-2.5">
        <img :src="logoUrl" alt="" class="h-9 w-9 shrink-0 object-contain" />
        <span class="font-display text-xl font-semibold text-brand-700">
          Carousel
        </span>
      </RouterLink>

      <RouterLink
        v-if="showLogin"
        to="/login"
        class="ml-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Log in
      </RouterLink>
    </div>
  </header>
</template>
