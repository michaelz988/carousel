<script setup>
import { computed, ref } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { submissionProgress, isEntryUnresolved } from '@/lib/lottery'

/**
 * Roster readiness, shown before a teacher locks entries or runs the lottery.
 *
 * Scoping matters here: the `showLottery` endpoint returns every student for
 * the assignment across *all* sections, not just the signed-in teacher's. An
 * unscoped "12 haven't submitted" would make a teacher chase students who are
 * not theirs, or misjudge their own section right before an action that is
 * hard to undo. So this defaults to the teacher's own students and makes the
 * wider view an explicit choice.
 *
 * Counts are shown first and names only on request, so a projected dashboard
 * does not put a "hasn't submitted" list in front of the class.
 */
const props = defineProps({
  students: { type: Array, default: () => [] },
  minEntries: { type: Number, default: 0 },
  teacherId: { type: [Number, String], default: null },
})

const scope = ref('mine') // mine | all
const openGroup = ref(null)

function teacherIdOf(item) {
  const t = item.ClassTeacher?.Teacher
  return t?.userId ?? t?.id ?? null
}

const mine = computed(() =>
  props.students.filter(
    (s) => String(teacherIdOf(s)) === String(props.teacherId),
  ),
)

const scoped = computed(() =>
  scope.value === 'mine' ? mine.value : props.students,
)

// If none of the roster maps to this teacher, a "0 students" panel would be
// alarming and probably wrong — surface it rather than silently showing zero.
const noneMatched = computed(
  () => props.students.length > 0 && mine.value.length === 0,
)

function bucketOf(item) {
  const p = submissionProgress(item.lotteries ?? [], props.minEntries)
  if (!p.started) return 'notStarted'
  if (!p.complete) return 'incomplete'
  return 'ready'
}

const groups = computed(() => {
  const out = { ready: [], incomplete: [], notStarted: [], attention: [] }
  for (const item of scoped.value) {
    out[bucketOf(item)].push(item)
    if ((item.lotteries ?? []).some(isEntryUnresolved)) out.attention.push(item)
  }
  return out
})

const byPeriod = computed(() => {
  const map = new Map()
  for (const item of scoped.value) {
    const key = item.period ?? '—'
    if (!map.has(key)) map.set(key, { period: key, total: 0, ready: 0 })
    const row = map.get(key)
    row.total += 1
    if (bucketOf(item) === 'ready') row.ready += 1
  }
  return [...map.values()].sort((a, b) => String(a.period).localeCompare(String(b.period)))
})

const tiles = computed(() => [
  { key: 'ready', label: 'Ready', count: groups.value.ready.length, cls: 'text-brand-700' },
  { key: 'incomplete', label: 'Incomplete', count: groups.value.incomplete.length, cls: 'text-accent-gold' },
  { key: 'notStarted', label: 'Not started', count: groups.value.notStarted.length, cls: 'text-ink-500' },
  { key: 'attention', label: 'Needs attention', count: groups.value.attention.length, cls: 'text-red-600' },
])

function nameOf(item) {
  const s = item.Student
  if (!s) return 'Unknown student'
  const full = [s.firstName, s.lastName].filter(Boolean).join(' ')
  return full || s.username || s.email || 'Unknown student'
}

function toggle(key) {
  openGroup.value = openGroup.value === key ? null : key
}

defineExpose({ scopedCount: computed(() => scoped.value.length), groups })
</script>

<template>
  <section class="rounded-xl border border-ink-200 bg-ink-50/60 p-4 sm:p-5">
    <header class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 class="font-display text-base font-semibold">Roster readiness</h3>

      <div
        class="inline-flex rounded-lg border border-ink-200 bg-white p-0.5 text-xs font-semibold"
        role="group"
        aria-label="Which students to include"
      >
        <button
          type="button"
          class="rounded-md px-2.5 py-1 transition"
          :class="scope === 'mine' ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-50'"
          @click="scope = 'mine'"
        >
          My students
        </button>
        <button
          type="button"
          class="rounded-md px-2.5 py-1 transition"
          :class="scope === 'all' ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-50'"
          @click="scope = 'all'"
        >
          All sections
        </button>
      </div>
    </header>

    <p
      v-if="noneMatched && scope === 'mine'"
      class="mb-3 rounded-lg border border-accent-gold-soft bg-accent-gold-soft/50 px-3 py-2 text-xs text-ink-700"
    >
      None of the {{ students.length }} students on this assignment are listed
      under your account. Switch to <strong>All sections</strong> to see the
      full roster.
    </p>

    <p class="mb-3 text-sm text-ink-600">
      <strong class="text-ink-900">{{ scoped.length }}</strong>
      {{ scoped.length === 1 ? 'student' : 'students' }}
      {{ scope === 'mine' ? 'in your sections' : 'across all sections' }}
    </p>

    <!-- Counts first; names only when asked for. -->
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <button
        v-for="tile in tiles"
        :key="tile.key"
        type="button"
        class="rounded-lg border bg-white px-3 py-2.5 text-left transition"
        :class="
          openGroup === tile.key
            ? 'border-brand-400 ring-2 ring-brand-100'
            : 'border-ink-200 hover:border-ink-300'
        "
        :aria-expanded="openGroup === tile.key"
        :disabled="!tile.count"
        @click="toggle(tile.key)"
      >
        <span class="block font-display text-xl font-semibold" :class="tile.cls">
          {{ tile.count }}
        </span>
        <span class="flex items-center gap-1 text-xs text-ink-500">
          {{ tile.label }}
          <ChevronDownIcon
            v-if="tile.count"
            class="h-3 w-3 transition"
            :class="openGroup === tile.key && 'rotate-180'"
            aria-hidden="true"
          />
        </span>
      </button>
    </div>

    <div
      v-if="openGroup && groups[openGroup].length"
      class="mt-3 rounded-lg border border-ink-200 bg-white p-3"
    >
      <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-700">
        <li v-for="(item, i) in groups[openGroup]" :key="i">
          {{ nameOf(item) }}
          <span v-if="item.period" class="text-xs text-ink-400">
            (P{{ item.period }})
          </span>
        </li>
      </ul>
    </div>

    <div v-if="byPeriod.length > 1" class="mt-3 flex flex-wrap gap-2">
      <span
        v-for="row in byPeriod"
        :key="row.period"
        class="rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs text-ink-600"
      >
        Period {{ row.period }}:
        <strong class="text-ink-900">{{ row.ready }}/{{ row.total }}</strong>
        ready
      </span>
    </div>
  </section>
</template>
