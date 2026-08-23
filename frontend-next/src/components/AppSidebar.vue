<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentsStore } from '@/stores/assignments'

const emit = defineEmits(['navigate'])

const auth = useAuthStore()
const assignments = useAssignmentsStore()
const route = useRoute()

const isTeacher = computed(() => auth.role === 'ROLE_TEACHER')
const isAdmin = computed(() => auth.role === 'ROLE_ADMIN')

const open = ref(true)
const activeId = computed(() => route.params.id ?? null)
watch(activeId, (id) => { if (id) open.value = true })

// Material drawer rows: 48px tall, icon + label, and a pill that runs to the
// drawer's right edge — the shape Classroom uses for the selected class.
const row =
  'flex h-12 items-center gap-4 rounded-r-full pl-6 pr-4 text-sm transition select-none'
const idle = 'text-ink-700 hover:bg-ink-100'
const active = 'bg-brand-50 font-semibold text-brand-800'

onMounted(() => assignments.load())
</script>

<template>
  <nav class="flex h-full flex-col py-3" aria-label="Main">
    <RouterLink
      to="/home"
      :class="[row, $route.path === '/home' ? active : idle]"
      @click="emit('navigate')"
    >
      <HomeIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
      Home
    </RouterLink>

    <hr class="my-3 border-ink-200" />

    <!-- Assignments -->
    <button
      type="button"
      :class="[row, idle, 'w-full']"
      :aria-expanded="open"
      @click="open = !open"
    >
      <ClipboardDocumentListIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
      <span class="flex-1 text-left">Assignments</span>
      <ChevronDownIcon
        class="h-4 w-4 shrink-0 transition-transform"
        :class="!open && '-rotate-90'"
        aria-hidden="true"
      />
    </button>

    <div v-if="open" class="mt-0.5">
      <p v-if="assignments.loading" class="px-6 py-2 text-xs text-ink-400">
        Loading…
      </p>

      <template v-else-if="assignments.items.length">
        <RouterLink
          v-for="a in assignments.items"
          :key="a.assignmentId"
          :to="`/assignments/${a.assignmentId}`"
          :class="[
            'flex min-h-12 items-center gap-4 rounded-r-full py-2.5 pr-4 pl-6 text-sm transition',
            String(a.assignmentId) === String(activeId) ? active : idle,
          ]"
          @click="emit('navigate')"
        >
          <span
            class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold"
            :class="
              String(a.assignmentId) === String(activeId)
                ? 'bg-brand-600 text-white'
                : 'bg-ink-200 text-ink-600'
            "
            aria-hidden="true"
          >
            {{ a.title.trim().charAt(0).toUpperCase() }}
          </span>
          <span class="line-clamp-2 leading-snug">{{ a.title }}</span>
        </RouterLink>
      </template>

      <p v-else class="px-6 py-2 text-xs leading-relaxed text-ink-400">
        {{
          isTeacher
            ? 'No assignments yet. Use + in the header to create one.'
            : 'Nothing assigned to you yet.'
        }}
      </p>
    </div>

    <template v-if="isAdmin">
      <hr class="my-3 border-ink-200" />
      <RouterLink
        to="/admin"
        :class="[row, $route.path === '/admin' ? active : idle]"
        @click="emit('navigate')"
      >
        <AcademicCapIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
        Teachers
      </RouterLink>
    </template>
  </nav>
</template>
