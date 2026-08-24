<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Shared by the login dialog and the /login page so the instructions and the
// sign-in flow can never drift apart.
const props = defineProps({ width: { type: Number, default: 280 } })

const auth = useAuthStore()
const buttonEl = ref(null)

const CLIENT_ID =
  '921798240468-7ef6ep21omf9pv15m4ilpa07patqjeio.apps.googleusercontent.com'

// --- Google Identity Services -------------------------------------------
// Unchanged: same client ID, same script URL, same initialize/renderButton
// calls, same credential handler.
function handleCredentialResponse(googleUser) {
  auth.glogin(googleUser)
}

function initializeGoogleSignIn() {
  if (!buttonEl.value) return
  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse,
  })
  window.google.accounts.id.renderButton(buttonEl.value, {
    theme: 'outline',
    size: 'large',
    width: props.width,
  })
}

onMounted(() => {
  if (!window.google || !window.google.accounts) {
    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
    if (existing) {
      existing.addEventListener('load', initializeGoogleSignIn)
      return
    }
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
  <div>
    <dl class="divide-y divide-ink-100 border-y border-ink-100">
      <div class="py-3.5 text-sm">
        <dt class="font-semibold text-ink-900">Students</dt>
        <dd class="mt-0.5 leading-relaxed text-ink-500">
          Use your school Google account — the same one your teacher used for
          the class roster.
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
    <div ref="buttonEl" class="mt-6 flex justify-center" />

    <p class="mt-5 text-center text-xs leading-relaxed text-ink-400">
      If sign-in is refused, your account has not been added to Carousel yet.
      Ask your teacher or administrator to add it.
    </p>
  </div>
</template>
