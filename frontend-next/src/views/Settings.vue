<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { displayName, initials, roleLabel, roleBadgeClass } from '@/lib/user'

const auth = useAuthStore()
const user = computed(() => auth.activeUser)
</script>

<template>
  <div class="page max-w-2xl">
    <h1 class="mb-5 font-display text-2xl font-semibold">Account</h1>

    <div class="card p-6 sm:p-8">
      <div class="flex items-center gap-4">
        <span
          class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-600 text-xl font-bold text-white"
          aria-hidden="true"
        >
          {{ initials(user) }}
        </span>
        <div class="min-w-0">
          <p class="truncate font-display text-lg font-semibold">
            {{ displayName(user) }}
          </p>
          <span class="badge mt-1 inline-block" :class="roleBadgeClass(auth.role)">
            {{ roleLabel(auth.role) }}
          </span>
        </div>
      </div>

      <dl class="mt-7 divide-y divide-ink-100 border-t border-ink-100 text-sm">
        <div class="flex justify-between gap-4 py-3">
          <dt class="text-ink-500">Email</dt>
          <dd class="truncate font-medium text-ink-900">{{ user.email }}</dd>
        </div>
        <div v-if="user.username" class="flex justify-between gap-4 py-3">
          <dt class="text-ink-500">Username</dt>
          <dd class="truncate font-medium text-ink-900">{{ user.username }}</dd>
        </div>
        <div class="flex justify-between gap-4 py-3">
          <dt class="text-ink-500">Signed in with</dt>
          <dd class="font-medium text-ink-900">Google</dd>
        </div>
      </dl>

      <p class="mt-6 rounded-lg bg-ink-50 px-4 py-3 text-xs leading-relaxed text-ink-500">
        Your name and email come from your Google account. To change your role
        or school, contact your administrator.
      </p>
    </div>
  </div>
</template>
