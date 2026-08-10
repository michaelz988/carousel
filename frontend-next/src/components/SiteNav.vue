<script setup>
import { computed, ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
  Squares2X2Icon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { roleLabel, roleBadgeClass, displayName, initials } from '@/lib/user'

const auth = useAuthStore()
const mobileOpen = ref(false)

const user = computed(() => auth.activeUser)
const homeLabel = computed(() =>
  auth.role === 'ROLE_ADMIN' ? 'Dashboard' : 'Assignments',
)

const links = computed(() => [
  { to: auth.homeRoute, label: homeLabel.value, icon: Squares2X2Icon },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
])

function logout() {
  auth.logout()
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-6">
      <!-- Brand -->
      <RouterLink
        :to="auth.homeRoute"
        class="flex shrink-0 items-center gap-2 font-display text-xl font-semibold text-brand-700"
      >
        <span
          class="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white"
          aria-hidden="true"
        >
          C
        </span>
        Carousel
      </RouterLink>

      <!-- Desktop links -->
      <nav class="ml-4 hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-700"
          active-class="bg-brand-50 text-brand-700"
        >
          <component :is="link.icon" class="h-4 w-4" aria-hidden="true" />
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <!-- User menu -->
        <Menu as="div" class="relative">
          <MenuButton
            class="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-ink-100"
          >
            <span
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white"
              aria-hidden="true"
            >
              {{ initials(user) }}
            </span>
            <span class="hidden text-left leading-tight sm:block">
              <span class="block text-sm font-semibold text-ink-900">
                {{ displayName(user) }}
              </span>
              <span class="badge mt-0.5" :class="roleBadgeClass(auth.role)">
                {{ roleLabel(auth.role) }}
              </span>
            </span>
          </MenuButton>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <MenuItems
              class="absolute right-0 mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-ink-200 bg-white shadow-raised focus:outline-none"
            >
              <div class="border-b border-ink-100 px-4 py-3">
                <p class="truncate text-sm text-ink-500">{{ user.email }}</p>
              </div>
              <MenuItem v-slot="{ active }">
                <RouterLink
                  to="/settings"
                  class="block px-4 py-2.5 text-sm text-ink-700"
                  :class="active && 'bg-ink-50'"
                >
                  Settings
                </RouterLink>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  type="button"
                  class="block w-full px-4 py-2.5 text-left text-sm text-ink-700"
                  :class="active && 'bg-ink-50'"
                  @click="logout"
                >
                  Log out
                </button>
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>

        <!-- Mobile toggle -->
        <button
          type="button"
          class="rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 md:hidden"
          :aria-expanded="mobileOpen"
          aria-label="Toggle navigation"
          @click="mobileOpen = !mobileOpen"
        >
          <component :is="mobileOpen ? XMarkIcon : Bars3Icon" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Mobile nav -->
    <nav
      v-if="mobileOpen"
      class="border-t border-ink-200 bg-white px-5 py-2 md:hidden"
    >
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600"
        active-class="bg-brand-50 text-brand-700"
        @click="mobileOpen = false"
      >
        <component :is="link.icon" class="h-4 w-4" aria-hidden="true" />
        {{ link.label }}
      </RouterLink>
    </nav>
  </header>
</template>
