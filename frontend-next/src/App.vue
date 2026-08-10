<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SiteNav from '@/components/SiteNav.vue'
import ToastHost from '@/components/ToastHost.vue'

const auth = useAuthStore()
const showNav = computed(() => auth.isAuthenticated)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SiteNav v-if="showNav" />
    <main class="flex-1">
      <RouterView />
    </main>
    <ToastHost />
  </div>
</template>
