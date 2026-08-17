<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'
import { useAssignmentsStore } from '@/stores/assignments'
import { notify } from '@/lib/notify'

const emit = defineEmits(['close'])

const assignments = useAssignmentsStore()
const router = useRouter()

const title = ref('')
const description = ref('')
const minEntries = ref(3)
const maxEntries = ref(5)
const saving = ref(false)

const error = computed(() => {
  if (!title.value.trim()) return 'Give the assignment a title.'
  if (minEntries.value < 1) return 'Students must submit at least one choice.'
  if (maxEntries.value < minEntries.value)
    return 'The maximum cannot be lower than the minimum.'
  return null
})

async function submit() {
  if (error.value || saving.value) return
  saving.value = true
  try {
    const created = await assignments.create({
      title: title.value.trim(),
      description: description.value.trim(),
      minEntries: minEntries.value,
      maxEntries: maxEntries.value,
    })
    notify(`"${created.title}" created.`, 'info')
    emit('close')
    if (created.assignmentId) {
      router.push(`/assignments/${created.assignmentId}`)
    }
  } catch (e) {
    console.log(e)
    notify('Could not create the assignment.')
  } finally {
    saving.value = false
  }
}

const field =
  'w-full rounded-lg border border-ink-200 px-3 py-2 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'
</script>

<template>
  <AppModal title="New assignment" size="md" @close="emit('close')">
    <form class="space-y-5" @submit.prevent="submit">
      <div>
        <label for="ca-title" class="mb-1.5 block text-sm font-semibold text-ink-900">
          Title
        </label>
        <input
          id="ca-title"
          v-model="title"
          type="text"
          maxlength="120"
          placeholder="e.g. Person of American Significance"
          :class="field"
          autofocus
        />
      </div>

      <div>
        <label
          for="ca-desc"
          class="mb-1.5 block text-sm font-semibold text-ink-900"
        >
          Instructions for students
        </label>
        <textarea
          id="ca-desc"
          v-model="description"
          rows="4"
          placeholder="Explain what students should choose and why."
          :class="field"
        />
      </div>

      <fieldset>
        <legend class="mb-1 text-sm font-semibold text-ink-900">
          How many choices must each student submit?
        </legend>
        <p class="mb-3 text-xs text-ink-500">
          Ranking more choices gives the lottery room to give everyone something
          they wanted.
        </p>
        <div class="flex gap-4">
          <label class="flex-1">
            <span class="mb-1.5 block text-xs font-semibold text-ink-600">
              Minimum
            </span>
            <input v-model.number="minEntries" type="number" min="1" max="10" :class="field" />
          </label>
          <label class="flex-1">
            <span class="mb-1.5 block text-xs font-semibold text-ink-600">
              Maximum
            </span>
            <input v-model.number="maxEntries" type="number" min="1" max="10" :class="field" />
          </label>
        </div>
      </fieldset>

      <p
        v-if="error && (title || description)"
        class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ error }}
      </p>
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="emit('close')">Cancel</AppButton>
      <AppButton :disabled="!!error || saving" @click="submit">
        {{ saving ? 'Creating…' : 'Create assignment' }}
      </AppButton>
    </template>
  </AppModal>
</template>
