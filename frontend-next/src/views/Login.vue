<script setup>
import PublicHeader from '@/components/PublicHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import GoogleSignIn from '@/components/GoogleSignIn.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-ink-50">
    <PublicHeader :show-login="false" />

    <main class="flex flex-1 items-center justify-center px-5 py-14 sm:px-6">
      <div class="w-full max-w-md">
        <div class="card p-8">
          <h1 class="font-display text-2xl font-semibold text-ink-900">
            Log in to Carousel
          </h1>
          <p class="mt-1.5 mb-6 text-ink-500">
            Carousel uses your Google account — there is no separate password.
          </p>
          <GoogleSignIn />
        </div>

        <p class="mt-6 text-center text-sm">
          <RouterLink
            to="/"
            class="text-ink-500 underline underline-offset-4 hover:text-ink-800"
          >
            Back to the overview
          </RouterLink>
        </p>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
