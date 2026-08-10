<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const CLIENT_ID =
  '921798240468-7ef6ep21omf9pv15m4ilpa07patqjeio.apps.googleusercontent.com'

// --- Google Identity Services -------------------------------------------
// Ported verbatim from the Vue 2 app: same client ID, same script URL, same
// initialize/renderButton calls, same credential handler. Only the store call
// at the end changed (Vuex dispatch -> Pinia action) because the store moved.
function handleCredentialResponse(googleUser) {
  auth.glogin(googleUser)
}

function initializeGoogleSignIn() {
  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse,
  })
  window.google.accounts.id.renderButton(
    document.getElementById('g_id_signin'),
    { theme: 'outline', size: 'large', width: 250 },
  )
}

onMounted(() => {
  if (!window.google || !window.google.accounts) {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    document.head.appendChild(script)
  } else {
    initializeGoogleSignIn()
  }
})
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Brand panel -->
    <section
      class="relative hidden flex-col justify-center overflow-hidden bg-brand-800 px-12 py-16 text-white lg:flex"
    >
      <div
        class="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative max-w-lg">
        <div class="mb-10 flex items-center gap-3">
          <span
            class="grid h-11 w-11 place-items-center rounded-xl bg-white/10 font-display text-lg font-semibold"
            aria-hidden="true"
          >
            C
          </span>
          <span class="font-display text-3xl font-semibold">Carousel</span>
        </div>

        <h1 class="font-display text-4xl leading-tight font-medium">
          Fair assignment of Persons of American Significance.
        </h1>
        <p class="mt-5 text-lg leading-relaxed text-white/80">
          Students rank the figures they want to research. Carousel runs a
          transparent lottery so every student receives a unique POAS.
        </p>

        <p class="mt-10 text-sm text-white/60">
          Made in open source by
          <a
            href="https://code4real.org/"
            target="_blank"
            class="underline underline-offset-4 hover:text-white"
          >
            Code4Real
          </a>
          .
        </p>
      </div>
    </section>

    <!-- Sign-in panel -->
    <section class="flex items-center justify-center px-5 py-16 sm:px-8">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span
            class="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 font-display font-semibold text-white"
            aria-hidden="true"
          >
            C
          </span>
          <span class="font-display text-2xl font-semibold text-brand-700">
            Carousel
          </span>
        </div>

        <div class="card p-8">
          <h2 class="font-display text-2xl font-semibold">Welcome</h2>
          <p class="mt-1 text-ink-500">Sign in with your Google account.</p>

          <dl class="my-7 divide-y divide-ink-100 border-y border-ink-100">
            <div class="py-3 text-sm">
              <dt class="font-semibold text-ink-900">Teachers</dt>
              <dd class="mt-0.5 text-ink-500">
                Use the Google account added to the system by your
                administrator.
              </dd>
            </div>
            <div class="py-3 text-sm">
              <dt class="font-semibold text-ink-900">Students</dt>
              <dd class="mt-0.5 text-ink-500">Use your school Google account.</dd>
            </div>
          </dl>

          <!-- Google renders its button into this element -->
          <div id="g_id_signin" class="flex justify-center" />
        </div>
      </div>
    </section>
  </div>
</template>
