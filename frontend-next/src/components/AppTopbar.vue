<script setup>
import { computed } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Bars3Icon, PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentsStore } from '@/stores/assignments'
import { displayName, roleLabel, roleBadgeClass } from '@/lib/user'
import UserAvatar from '@/components/UserAvatar.vue'
import logoUrl from '@/assets/logo.png'

const emit = defineEmits(['toggle-nav', 'create'])

const auth = useAuthStore()
const assignments = useAssignmentsStore()

const user = computed(() => auth.activeUser)
const isTeacher = computed(() => auth.role === 'ROLE_TEACHER')

function logout() {
  assignments.reset()
  auth.logout()
}

// Circular icon button, the way Classroom treats every header control.
const iconBtn =
  'grid h-10 w-10 place-items-center rounded-full text-ink-600 transition hover:bg-ink-100 focus-visible:bg-ink-100'
</script>

<template>
  <header
    class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-1 border-b border-ink-200 bg-white px-2 sm:px-4"
  >
    <button
      type="button"
      :class="iconBtn"
      aria-label="Toggle navigation menu"
      @click="emit('toggle-nav')"
    >
      <Bars3Icon class="h-6 w-6" />
    </button>

    <!-- Brand lives in the header, not the drawer -->
    <RouterLink to="/home" class="ml-1 flex items-center gap-2.5 rounded-lg px-2 py-1">
      <img :src="logoUrl" alt="" class="h-8 w-8 shrink-0 object-contain" />
      <span class="font-display text-xl font-semibold text-brand-700">
        Carousel
      </span>
    </RouterLink>

    <div class="ml-auto flex items-center gap-1 sm:gap-2">
      <button
        v-if="isTeacher"
        type="button"
        :class="iconBtn"
        aria-label="Create assignment"
        title="Create assignment"
        @click="emit('create')"
      >
        <PlusIcon class="h-6 w-6" />
      </button>

      <!-- Role sits to the left of the photo and name -->
      <span class="badge hidden sm:inline-block" :class="roleBadgeClass(auth.role)">
        {{ roleLabel(auth.role) }}
      </span>

      <Menu as="div" class="relative">
        <MenuButton
          class="flex items-center gap-2 rounded-full p-1 transition hover:bg-ink-100"
        >
          <UserAvatar :user="user" :size="34" />
          <span class="hidden pr-1 text-sm font-medium text-ink-800 md:block">
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
            class="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-raised focus:outline-none"
          >
            <div class="flex flex-col items-center gap-2 border-b border-ink-100 px-4 py-5">
              <UserAvatar :user="user" :size="56" />
              <p class="mt-1 text-sm font-semibold text-ink-900">
                {{ displayName(user) }}
              </p>
              <p class="max-w-full truncate text-xs text-ink-500">
                {{ user.email }}
              </p>
              <span class="badge mt-1" :class="roleBadgeClass(auth.role)">
                {{ roleLabel(auth.role) }}
              </span>
            </div>
            <MenuItem v-slot="{ active }">
              <RouterLink
                to="/settings"
                class="block px-4 py-3 text-sm text-ink-700"
                :class="active && 'bg-ink-50'"
              >
                Settings
              </RouterLink>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <button
                type="button"
                class="block w-full px-4 py-3 text-left text-sm text-ink-700"
                :class="active && 'bg-ink-50'"
                @click="logout"
              >
                Sign out
              </button>
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  </header>
</template>
