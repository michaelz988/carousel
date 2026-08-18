<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import PublicHeader from '@/components/PublicHeader.vue'
import PublicFooter from '@/components/PublicFooter.vue'

const auth = useAuthStore()

const CLIENT_ID =
  '921798240468-7ef6ep21omf9pv15m4ilpa07patqjeio.apps.googleusercontent.com'

// --- Google Identity Services -------------------------------------------
// Unchanged: same client ID, same script URL, same initialize/renderButton
// calls, same credential handler. Only the page around it was restyled.
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
    { theme: 'outline', size: 'large', width: 280 },
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
  <div class="flex min-h-screen flex-col bg-ink-50">
    <PublicHeader :show-login="false" />

    <main class="flex flex-1 items-center justify-center px-5 py-14 sm:px-6">
      <div class="w-full max-w-md">
        <div class="card p-8">
          <h1 class="font-display text-2xl font-semibold text-ink-900">
            Log in to Carousel
          </h1>
          <p class="mt-1.5 text-ink-500">
            Carousel uses your Google account — there is no separate password.
          </p>

          <dl class="my-7 divide-y divide-ink-100 border-y border-ink-100">
            <div class="py-3.5 text-sm">
              <dt class="font-semibold text-ink-900">Students</dt>
              <dd class="mt-0.5 leading-relaxed text-ink-500">
                Use your school Google account — the same one your teacher used
                for the class roster.
              </dd>
            </div>
            <div class="py-3.5 text-sm">
              <dt class="font-semibold text-ink-900">Teachers</dt>
              <dd class="mt-0.5 leading-relaxed text-ink-500">
                Use the Google account your administrator added to Carousel.
              </dd>
            </div>
          </dl>

          <!-- Google renders its button into this element -->
          <div id="g_id_signin" class="flex justify-center" />

          <p class="mt-6 text-center text-xs leading-relaxed text-ink-400">
            If sign-in is refused, your account has not been added to Carousel
            yet. Ask your teacher or administrator to add it.
          </p>
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

    <PublicFooter />
  </div>
</template>
