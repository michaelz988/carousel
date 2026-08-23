<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import ToastHost from '@/components/ToastHost.vue'
import CreateAssignmentModal from '@/components/CreateAssignmentModal.vue'

const auth = useAuthStore()
const route = useRoute()

// Public pages (landing, login) render standalone, without the app shell.
const showChrome = computed(
  () => auth.isAuthenticated && route.matched.some((r) => r.meta.requiresAuth),
)

// A persistent drawer on desktop, a modal one on small screens — the way
// Classroom's hamburger behaves. The default follows the breakpoint, and
// crossing it resets to that default, so widening the window brings the
// drawer back rather than leaving it hidden with no explanation.
const desktopQuery = window.matchMedia('(min-width: 1024px)')
const isDesktop = ref(desktopQuery.matches)
const navOpen = ref(desktopQuery.matches)
const showCreate = ref(false)

function onBreakpointChange(e) {
  isDesktop.value = e.matches
  navOpen.value = e.matches
}

onMounted(() => desktopQuery.addEventListener('change', onBreakpointChange))
onBeforeUnmount(() =>
  desktopQuery.removeEventListener('change', onBreakpointChange),
)

// The mobile drawer covers the page, so close it once navigation happens.
watch(() => route.fullPath, () => {
  if (!isDesktop.value) navOpen.value = false
})
</script>

<template>
  <div v-if="showChrome" class="flex min-h-screen flex-col bg-ink-50">
    <AppTopbar @toggle-nav="navOpen = !navOpen" @create="showCreate = true" />

    <div class="flex flex-1">
      <!-- Drawer sits below the full-width header -->
      <aside
        v-show="navOpen"
        class="fixed inset-y-16 left-0 z-30 w-[300px] overflow-y-auto bg-ink-50 lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100vh-4rem)] lg:shrink-0"
      >
        <AppSidebar @navigate="() => {}" />
      </aside>

      <div
        v-if="navOpen"
        class="fixed inset-0 top-16 z-20 bg-ink-900/40 lg:hidden"
        @click="navOpen = false"
      />

      <main class="min-w-0 flex-1">
        <RouterView v-slot="{ Component }">
          <component :is="Component" @create="showCreate = true" />
        </RouterView>
      </main>
    </div>

    <CreateAssignmentModal v-if="showCreate" @close="showCreate = false" />
  </div>

  <!-- Signed out: no chrome -->
  <main v-else class="min-h-screen">
    <RouterView />
  </main>

  <ToastHost />
</template>
