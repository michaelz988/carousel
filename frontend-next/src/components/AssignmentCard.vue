<script setup>
import { computed } from 'vue'
import { formatRelative, formatDate } from '@/lib/date'
import { lotteryState } from '@/lib/user'

const props = defineProps({
  assignment: { type: Object, required: true },
})

// The assignment record already carries `state`, `dueDate`, `description` and
// the entry limits — the old card dropped all of it and showed only a title.
const status = computed(() => lotteryState(props.assignment.state))
const due = computed(() => formatDate(props.assignment.dueDate))
const created = computed(() => formatRelative(props.assignment.createdAt))

const entryRange = computed(() => {
  const { minEntries, maxEntries } = props.assignment
  if (!minEntries && !maxEntries) return null
  if (minEntries && maxEntries && minEntries !== maxEntries) {
    return `${minEntries}–${maxEntries} choices`
  }
  return `${minEntries || maxEntries} choices`
})
</script>

<template>
  <article class="card p-5 transition hover:shadow-raised sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="font-display text-lg font-semibold text-ink-900">
          {{ assignment.title }}
        </h2>
        <p class="mt-0.5 text-xs text-ink-400">Created {{ created }}</p>
      </div>
      <span class="badge shrink-0" :class="status.cls">{{ status.label }}</span>
    </div>

    <p
      v-if="assignment.description"
      class="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600"
    >
      {{ assignment.description }}
    </p>

    <dl
      v-if="due || entryRange"
      class="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-500"
    >
      <div v-if="due" class="flex gap-1.5">
        <dt class="font-semibold text-ink-600">Due</dt>
        <dd>{{ due }}</dd>
      </div>
      <div v-if="entryRange" class="flex gap-1.5">
        <dt class="font-semibold text-ink-600">Submit</dt>
        <dd>{{ entryRange }}</dd>
      </div>
    </dl>

    <div class="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
      <slot name="actions" />
    </div>
  </article>
</template>
