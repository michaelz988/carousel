<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  ChevronRightIcon,
  PlusIcon,
  AcademicCapIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentsStore } from '@/stores/assignments'
import { lotteryState } from '@/lib/lottery'
import logoUrl from '@/assets/logo.png'

const emit = defineEmits(['create', 'navigate'])

const auth = useAuthStore()
const assignments = useAssignmentsStore()
const route = useRoute()

const isTeacher = computed(() => auth.role === 'ROLE_TEACHER')
const isAdmin = computed(() => auth.role === 'ROLE_ADMIN')

// Open by default: the assignment list is the point of the sidebar.
const open = ref(true)

const activeId = computed(() => route.params.id ?? null)

// Keep the group open when navigating into an assignment.
watch(activeId, (id) => { if (id) open.value = true })

onMounted(() => assignments.load())
</script>

<template>
  <div class="flex h-full flex-col gap-1 p-3">
    <!-- Brand -->
    <RouterLink
      to="/home"
      class="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2"
      @click="emit('navigate')"
    >
      <img :src="logoUrl" alt="" class="h-8 w-8 shrink-0 object-contain" />
      <span class="font-display text-lg font-semibold text-brand-700">
        Carousel
      </span>
    </RouterLink>

    <RouterLink
      to="/home"
      class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-700"
      active-class="bg-brand-50 text-brand-700"
      exact-active-class="bg-brand-50 text-brand-700"
      @click="emit('navigate')"
    >
      <HomeIcon class="h-4.5 w-4.5" aria-hidden="true" />
      Home
    </RouterLink>

    <!-- Assignments group -->
    <div class="mt-1">
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-700"
          :aria-expanded="open"
          @click="open = !open"
        >
          <ChevronRightIcon
            class="h-4 w-4 transition-transform"
            :class="open && 'rotate-90'"
            aria-hidden="true"
          />
          Assignments
          <span
            v-if="assignments.items.length"
            class="ml-auto text-xs font-normal text-ink-400"
          >
            {{ assignments.items.length }}
          </span>
        </button>

        <button
          v-if="isTeacher"
          type="button"
          class="rounded-lg p-1.5 text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
          title="New assignment"
          aria-label="New assignment"
          @click="emit('create')"
        >
          <PlusIcon class="h-4 w-4" />
        </button>
      </div>

      <div v-if="open" class="mt-0.5 ml-4 border-l border-ink-200 pl-2">
        <p v-if="assignments.loading" class="px-2 py-2 text-xs text-ink-400">
          Loading…
        </p>

        <template v-else-if="assignments.items.length">
          <RouterLink
            v-for="a in assignments.items"
            :key="a.assignmentId"
            :to="`/assignments/${a.assignmentId}`"
            class="group block rounded-lg px-2.5 py-2 text-sm transition hover:bg-brand-50"
            :class="
              String(a.assignmentId) === String(activeId)
                ? 'bg-brand-50 text-brand-700'
                : 'text-ink-600'
            "
            @click="emit('navigate')"
          >
            <span class="line-clamp-2 leading-snug font-medium">
              {{ a.title }}
            </span>
            <span
              class="badge mt-1 inline-block"
              :class="lotteryState(a.state).cls"
            >
              {{ lotteryState(a.state).label }}
            </span>
          </RouterLink>
        </template>

        <p v-else class="px-2 py-2 text-xs leading-relaxed text-ink-400">
          {{
            isTeacher
              ? 'No assignments yet. Use + to create one.'
              : 'Nothing assigned to you yet.'
          }}
        </p>
      </div>
    </div>

    <RouterLink
      v-if="isAdmin"
      to="/admin"
      class="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-700"
      active-class="bg-brand-50 text-brand-700"
      @click="emit('navigate')"
    >
      <AcademicCapIcon class="h-4.5 w-4.5" aria-hidden="true" />
      Teachers
    </RouterLink>
  </div>
</template>
