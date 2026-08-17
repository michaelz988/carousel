<script setup>
import { computed } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentsStore } from '@/stores/assignments'
import { displayName, roleLabel, roleBadgeClass } from '@/lib/user'
import UserAvatar from '@/components/UserAvatar.vue'

defineProps({ title: { type: String, default: '' } })
const emit = defineEmits(['toggle-sidebar'])

const auth = useAuthStore()
const assignments = useAssignmentsStore()

const user = computed(() => auth.activeUser)

function logout() {
  assignments.reset()
  auth.logout()
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur sm:px-6"
  >
    <button
      type="button"
      class="rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 lg:hidden"
      aria-label="Toggle navigation"
      @click="emit('toggle-sidebar')"
    >
      <Bars3Icon class="h-5 w-5" />
    </button>

    <h1 v-if="title" class="truncate font-display text-lg font-semibold">
      {{ title }}
    </h1>

    <div class="ml-auto flex items-center gap-3">
      <!-- Role sits to the left of the photo and name -->
      <span class="badge hidden sm:inline-block" :class="roleBadgeClass(auth.role)">
        {{ roleLabel(auth.role) }}
      </span>

      <Menu as="div" class="relative">
        <MenuButton
          class="flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 transition hover:bg-ink-100"
        >
          <UserAvatar :user="user" :size="36" />
          <span class="hidden text-sm font-semibold text-ink-900 sm:block">
            {{ displayName(user) }}
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
            class="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-ink-200 bg-white shadow-raised focus:outline-none"
          >
            <div class="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
              <UserAvatar :user="user" :size="38" />
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-ink-900">
                  {{ displayName(user) }}
                </p>
                <p class="truncate text-xs text-ink-500">{{ user.email }}</p>
              </div>
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
    </div>
  </header>
</template>
