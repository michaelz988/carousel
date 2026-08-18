<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentsStore } from '@/stores/assignments'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import ToastHost from '@/components/ToastHost.vue'
import CreateAssignmentModal from '@/components/CreateAssignmentModal.vue'

const auth = useAuthStore()
const assignments = useAssignmentsStore()
const route = useRoute()

// Public pages (landing, login) render standalone, without the app shell.
const showChrome = computed(
  () => auth.isAuthenticated && route.matched.some((r) => r.meta.requiresAuth),
)
const mobileNavOpen = ref(false)
const showCreate = ref(false)

const pageTitle = computed(() => {
  if (route.params.id) {
    return assignments.byId(route.params.id)?.title ?? 'Assignment'
  }
  return route.meta?.title ?? ''
})

watch(() => route.fullPath, () => { mobileNavOpen.value = false })
</script>

<template>
  <div v-if="showChrome" class="min-h-screen lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
    <!-- Sidebar: fixed drawer on small screens, a column on large -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-[264px] overflow-y-auto border-r border-ink-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0"
      :class="mobileNavOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <AppSidebar
        @create="showCreate = true"
        @navigate="mobileNavOpen = false"
      />
    </aside>

    <div
      v-if="mobileNavOpen"
      class="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
      @click="mobileNavOpen = false"
    />

    <div class="flex min-w-0 flex-col">
      <AppTopbar :title="pageTitle" @toggle-sidebar="mobileNavOpen = !mobileNavOpen" />
      <main class="flex-1">
        <!-- v-slot so routed views can ask the shell to open the create modal -->
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
