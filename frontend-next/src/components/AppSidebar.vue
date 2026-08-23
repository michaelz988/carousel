<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  ChevronUpIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentsStore } from '@/stores/assignments'
import { lotteryState } from '@/lib/lottery'

const emit = defineEmits(['navigate'])

const auth = useAuthStore()
const assignments = useAssignmentsStore()
const route = useRoute()

const isTeacher = computed(() => auth.role === 'ROLE_TEACHER')
const isAdmin = computed(() => auth.role === 'ROLE_ADMIN')

const open = ref(true)
const activeId = computed(() => route.params.id ?? null)
watch(activeId, (id) => { if (id) open.value = true })

// Measured from Classroom: rows are 48px, and the selected state is a pill
// inset 12px on BOTH sides with full rounding — not a bar running to the edge.
const row =
  'mx-3 flex items-center gap-5 rounded-full px-4 text-sm transition select-none'
const idle = 'text-ink-700 hover:bg-ink-100'
const active = 'bg-brand-100 font-medium text-brand-800'

onMounted(() => assignments.load())
</script>

<template>
  <nav class="flex h-full flex-col py-2" aria-label="Main">
    <RouterLink
      to="/home"
      :class="[row, 'h-12', $route.path === '/home' ? active : idle]"
      @click="emit('navigate')"
    >
      <HomeIcon class="h-6 w-6 shrink-0" aria-hidden="true" />
      Home
    </RouterLink>

    <hr class="mx-3 my-2 border-ink-200" />

    <!-- Collapsible group, matching Classroom's "Enrolled" section -->
    <button
      type="button"
      :class="[row, 'h-12', idle]"
      :aria-expanded="open"
      @click="open = !open"
    >
      <ClipboardDocumentListIcon class="h-6 w-6 shrink-0" aria-hidden="true" />
      <span class="flex-1 text-left">Assignments</span>
      <ChevronUpIcon
        class="h-4 w-4 shrink-0 transition-transform"
        :class="!open && 'rotate-180'"
        aria-hidden="true"
      />
    </button>

    <div v-if="open">
      <p v-if="assignments.loading" class="px-7 py-2 text-xs text-ink-400">
        Loading…
      </p>

      <template v-else-if="assignments.items.length">
        <RouterLink
          v-for="a in assignments.items"
          :key="a.assignmentId"
          :to="`/assignments/${a.assignmentId}`"
          :class="[
            row,
            'min-h-12 py-2',
            String(a.assignmentId) === String(activeId) ? active : idle,
          ]"
          @click="emit('navigate')"
        >
          <span
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-medium"
            :class="
              String(a.assignmentId) === String(activeId)
                ? 'bg-brand-600 text-white'
                : 'bg-ink-200 text-ink-600'
            "
            aria-hidden="true"
          >
            {{ a.title.trim().charAt(0).toUpperCase() }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate leading-tight">{{ a.title }}</span>
            <!-- Secondary line, where Classroom shows the class section -->
            <span class="block truncate text-xs leading-tight text-ink-500">
              {{ lotteryState(a.state).label }}
            </span>
          </span>
        </RouterLink>
      </template>

      <p v-else class="px-7 py-2 text-xs leading-relaxed text-ink-400">
        {{
          isTeacher
            ? 'No assignments yet. Use + in the header to create one.'
            : 'Nothing assigned to you yet.'
        }}
      </p>
    </div>

    <template v-if="isAdmin">
      <hr class="mx-3 my-2 border-ink-200" />
      <RouterLink
        to="/admin"
        :class="[row, 'h-12', $route.path === '/admin' ? active : idle]"
        @click="emit('navigate')"
      >
        <AcademicCapIcon class="h-6 w-6 shrink-0" aria-hidden="true" />
        Teachers
      </RouterLink>
    </template>
  </nav>
</template>
