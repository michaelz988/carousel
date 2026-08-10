<script setup>
import { computed } from 'vue'
import { displayName, initials, roleLabel, roleBadgeClass } from '@/lib/user'

const props = defineProps({
  user: { type: Object, required: true },
  role: { type: String, default: '' },
})

const name = computed(() => displayName(props.user))
const inits = computed(() => initials(props.user))
</script>

<template>
  <aside
    class="card flex items-center gap-4 p-5 sm:flex-col sm:gap-0 sm:p-6 sm:text-center"
  >
    <span
      class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-600 text-base font-bold text-white sm:mb-3 sm:h-16 sm:w-16 sm:text-xl"
      aria-hidden="true"
    >
      {{ inits }}
    </span>
    <div class="min-w-0">
      <p class="truncate font-semibold text-ink-900">{{ name }}</p>
      <p class="truncate text-sm text-ink-500">{{ user.email }}</p>
      <span class="badge mt-2 inline-block" :class="roleBadgeClass(role)">
        {{ roleLabel(role) }}
      </span>
    </div>
  </aside>
</template>
