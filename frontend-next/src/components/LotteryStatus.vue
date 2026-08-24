<script setup>
import { computed } from 'vue'
import { CheckIcon } from '@heroicons/vue/20/solid'
import {
  LOTTERY_STEPS,
  studentGuidance,
  teacherGuidance,
} from '@/lib/lottery'

/**
 * The lottery lifecycle, shown the same way to both roles so students and
 * teachers share one mental model of where things stand.
 */
const props = defineProps({
  state: { type: Number, default: 0 },
  role: { type: String, default: 'student' }, // student | teacher
  compact: { type: Boolean, default: false },
})

const guidance = computed(() =>
  props.role === 'teacher'
    ? teacherGuidance(props.state)
    : studentGuidance(props.state),
)
</script>

<template>
  <div>
    <ol
      class="flex items-center"
      :aria-label="`Lottery progress: step ${state + 1} of ${LOTTERY_STEPS.length}`"
    >
      <li
        v-for="(step, i) in LOTTERY_STEPS"
        :key="step"
        class="flex flex-1 items-center last:flex-none"
      >
        <span class="flex shrink-0 items-center gap-2">
          <span
            class="grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition"
            :class="
              i < state
                ? 'bg-brand-600 text-white'
                : i === state
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                  : 'border border-ink-200 bg-white text-ink-400'
            "
          >
            <CheckIcon v-if="i < state" class="h-4 w-4" aria-hidden="true" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span
            v-if="!compact"
            class="hidden text-xs font-semibold sm:block"
            :class="i <= state ? 'text-brand-700' : 'text-ink-400'"
          >
            {{ step }}
            <span v-if="i === state" class="sr-only">(current step)</span>
          </span>
        </span>

        <span
          v-if="i < LOTTERY_STEPS.length - 1"
          class="mx-2 h-px flex-1"
          :class="i < state ? 'bg-brand-500' : 'bg-ink-200'"
          aria-hidden="true"
        />
      </li>
    </ol>

    <div v-if="guidance.headline" class="mt-3">
      <p class="text-sm font-semibold text-ink-900">{{ guidance.headline }}</p>
      <p class="mt-0.5 text-sm leading-relaxed text-ink-500">
        {{ guidance.detail }}
      </p>
    </div>
  </div>
</template>
