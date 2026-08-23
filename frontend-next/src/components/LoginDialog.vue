<script setup>
import AppModal from '@/components/AppModal.vue'
import GoogleSignIn from '@/components/GoogleSignIn.vue'

const emit = defineEmits(['close'])
</script>

<template>
  <AppModal size="sm" title="Log in to Carousel" @close="emit('close')">
    <p class="-mt-1 mb-5 text-sm text-ink-500">
      Carousel uses your Google account — there is no separate password.
    </p>
    <GoogleSignIn />
  </AppModal>
</template>
