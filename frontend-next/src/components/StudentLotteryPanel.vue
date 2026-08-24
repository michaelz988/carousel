<script setup>
import { computed } from 'vue'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline'
import LotteryStatus from '@/components/LotteryStatus.vue'
import { COMPLETED, submissionProgress } from '@/lib/lottery'

/**
 * Everything a student needs to know about one assignment at a glance:
 * where the lottery is, whether their own submission is complete, and — once
 * assignments are final — which POAS they received.
 */
const props = defineProps({
  assignment: { type: Object, required: true },
  // { lotteries, poasStats, poasAssigned } — null while loading
  lottery: { type: Object, default: null },
})

const loading = computed(() => props.lottery === null)

const progress = computed(() =>
  submissionProgress(
    props.lottery?.lotteries ?? [],
    props.assignment.minEntries,
  ),
)

const isComplete = computed(() => props.assignment.state === COMPLETED)

// `poasAssigned` is preferenceChosen: a 1-based index into the student's own
// ranked entries, 0 meaning nothing was assigned.
const assignedEntry = computed(() => {
  const rank = props.lottery?.poasAssigned
  if (!rank) return null
  return props.lottery?.lotteries?.[rank - 1] ?? null
})

const rankLabel = computed(() => {
  const rank = props.lottery?.poasAssigned
  if (!rank) return null
  const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th']
  return ordinals[rank - 1] ?? `#${rank}`
})
</script>

<template>
  <div class="mt-4 border-t border-ink-100 pt-4">
    <LotteryStatus :state="assignment.state" role="student" />

    <!-- Result: only presented once assignments are final. Before that the
         backend can still clear assignments, so showing one would be a
         promise the system cannot keep. -->
    <div
      v-if="isComplete && assignedEntry"
      class="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-brand-700">
        Your Person of American Significance
      </p>
      <p class="mt-1 font-display text-xl font-semibold text-brand-800">
        {{ assignedEntry.name }}
      </p>
      <p v-if="rankLabel" class="mt-0.5 text-sm text-brand-700">
        Your {{ rankLabel }} choice
      </p>
      <a
        v-if="assignedEntry.wikiLink"
        :href="assignedEntry.wikiLink"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 underline underline-offset-4 hover:text-brand-800"
      >
        Read the Wikipedia page
        <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>

    <!-- Completed, but this student did not receive one. Say so rather than
         leaving an unexplained blank. -->
    <div
      v-else-if="isComplete && !loading"
      class="mt-4 flex gap-2.5 rounded-xl border border-accent-gold-soft bg-accent-gold-soft/50 p-4 text-sm"
    >
      <ExclamationCircleIcon
        class="h-5 w-5 shrink-0 text-accent-gold"
        aria-hidden="true"
      />
      <p class="text-ink-700">
        No POAS was assigned to you in this lottery. Please speak to your
        teacher.
      </p>
    </div>

    <!-- Submission progress, so a student knows they are done without having
         to open the entry form. -->
    <div v-else-if="!loading" class="mt-4 flex flex-wrap items-center gap-2">
      <span
        v-if="progress.complete"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700"
      >
        <CheckCircleIcon class="h-4 w-4" aria-hidden="true" />
        {{ progress.completed }} of {{ progress.required }} required choices
        saved
      </span>
      <span
        v-else-if="progress.started"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-accent-gold"
      >
        <ExclamationCircleIcon class="h-4 w-4" aria-hidden="true" />
        {{ progress.completed }} of {{ progress.required }} required choices
        complete
      </span>
      <span v-else class="text-sm text-ink-500">
        You haven't added any choices yet.
      </span>

      <span
        v-if="progress.unresolved"
        class="badge bg-red-50 text-red-700"
        :title="'These names could not be matched to a Wikipedia page'"
      >
        {{ progress.unresolved }} need attention
      </span>
    </div>

    <div v-else class="mt-4 h-5 w-56 animate-pulse rounded bg-ink-100" />
  </div>
</template>
