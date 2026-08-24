<script setup>
import { computed, onMounted } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentsStore } from '@/stores/assignments'
import { displayName } from '@/lib/user'
import { lotteryState, COMPLETED, OPEN } from '@/lib/lottery'
import AppButton from '@/components/AppButton.vue'
import EmptyState from '@/components/EmptyState.vue'

const emit = defineEmits(['create'])

const auth = useAuthStore()
const assignments = useAssignmentsStore()

const isTeacher = computed(() => auth.role === 'ROLE_TEACHER')

const firstName = computed(() => displayName(auth.activeUser).split(' ')[0])

const needsAttention = computed(() =>
  assignments.items.filter((a) => a.state === OPEN).length,
)
const finished = computed(() =>
  assignments.items.filter((a) => a.state === COMPLETED).length,
)

onMounted(() => assignments.load())
</script>

<template>
  <div class="page">
    <header class="mb-7">
      <h2 class="font-display text-2xl font-semibold">
        Welcome back, {{ firstName }}
      </h2>
      <p class="mt-1 text-ink-500">
        {{
          isTeacher
            ? 'Pick an assignment from the sidebar to manage its roster and lottery.'
            : 'Pick an assignment from the sidebar to submit or review your choices.'
        }}
      </p>
    </header>

    <div v-if="assignments.loading" class="space-y-3" aria-hidden="true">
      <div v-for="n in 2" :key="n" class="card animate-pulse p-6">
        <div class="h-5 w-1/3 rounded bg-ink-100" />
        <div class="mt-3 h-3 w-2/3 rounded bg-ink-100" />
      </div>
    </div>

    <template v-else-if="assignments.items.length">
      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <div class="card p-4">
          <p class="font-display text-2xl font-semibold">
            {{ assignments.items.length }}
          </p>
          <p class="text-sm text-ink-500">
            {{ assignments.items.length === 1 ? 'Assignment' : 'Assignments' }}
          </p>
        </div>
        <div class="card p-4">
          <p class="font-display text-2xl font-semibold text-brand-700">
            {{ needsAttention }}
          </p>
          <p class="text-sm text-ink-500">Open for entries</p>
        </div>
        <div class="card p-4">
          <p class="font-display text-2xl font-semibold">{{ finished }}</p>
          <p class="text-sm text-ink-500">Completed</p>
        </div>
      </div>

      <ul class="space-y-3">
        <li v-for="a in assignments.items" :key="a.assignmentId">
          <RouterLink
            :to="`/assignments/${a.assignmentId}`"
            class="card block p-5 transition hover:shadow-raised"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <h3 class="font-display text-lg font-semibold text-ink-900">
                {{ a.title }}
              </h3>
              <span class="badge shrink-0" :class="lotteryState(a.state).cls">
                {{ lotteryState(a.state).label }}
              </span>
            </div>
            <p
              v-if="a.description"
              class="mt-2 line-clamp-2 text-sm text-ink-600"
            >
              {{ a.description }}
            </p>
          </RouterLink>
        </li>
      </ul>
    </template>

    <EmptyState
      v-else
      :title="isTeacher ? 'No assignments yet' : 'Nothing assigned to you yet'"
      :description="
        isTeacher
          ? 'Create an assignment, import your roster, and students can start submitting choices.'
          : 'When your teacher opens an assignment it will appear here and in the sidebar.'
      "
    >
      <AppButton v-if="isTeacher" @click="emit('create')">
        <PlusIcon class="h-4 w-4" aria-hidden="true" />
        New assignment
      </AppButton>
    </EmptyState>
  </div>
</template>
