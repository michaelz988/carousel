<script setup>
import logoUrl from '@/assets/logo.png'
</script>

<template>
  <footer class="border-t border-ink-200 bg-white">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <p class="flex items-center gap-2">
        <span>Made in open source by</span>
        <a
          href="https://code4real.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          <img :src="logoUrl" alt="" class="h-6 w-6 object-contain" />
          Code4Real
        </a>
      </p>
      <p class="text-ink-400">
        Built for AP English classrooms &middot; {{ new Date().getFullYear() }}
      </p>
    </div>
  </footer>
</template>
