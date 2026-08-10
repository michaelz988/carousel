<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Role landing. Same behaviour as before: redirect straight to the dashboard
// that matches the signed-in user's role.
const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  const target = auth.homeRoute
  if (target !== '/') router.replace(target)
})
</script>

<template>
  <div class="grid min-h-[70vh] place-items-center px-5">
    <div class="card w-full max-w-sm p-10 text-center">
      <span
        class="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-600 font-display text-lg font-semibold text-white"
        aria-hidden="true"
      >
        C
      </span>
      <h1 class="mt-4 font-display text-2xl font-semibold text-brand-700">
        Carousel
      </h1>

      <div
        class="mt-6 flex items-center justify-center gap-2.5 text-sm text-ink-500"
      >
        <span
          class="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
          aria-hidden="true"
        />
        Taking you to your dashboard…
      </div>

      <RouterLink
        v-if="auth.homeRoute !== '/'"
        :to="auth.homeRoute"
        class="mt-7 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Continue
      </RouterLink>
      <RouterLink
        v-else
        to="/login"
        class="mt-7 inline-block rounded-lg border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
      >
        Return to sign in
      </RouterLink>
    </div>
  </div>
</template>
