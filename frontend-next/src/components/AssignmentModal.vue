<script setup>
import { onMounted, ref } from 'vue'
import AssignmentDataService from '@/services/AssignmentDataService'
import { useAuthStore } from '@/stores/auth'
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'
import { formatRelative } from '@/lib/date'

const emit = defineEmits(['close'])
const auth = useAuthStore()

const assignment = ref({})
const saving = ref(false)

function load() {
  assignment.value = { ...auth.activeAssignment }
}

async function updateAssignment() {
  saving.value = true
  try {
    await AssignmentDataService.update(
      assignment.value.assignmentId,
      assignment.value,
    )
    // Re-fetch so the store holds the persisted record. (The Vue 2 version
    // called `getOne()`, which does not exist on this service — it only
    // defines `get()` — so this refresh silently threw before.)
    const response = await AssignmentDataService.get(
      assignment.value.assignmentId,
    )
    assignment.value = response.data
    auth.updateActiveAssignment(response.data)
  } catch (e) {
    console.log(e)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <AppModal size="md" @close="emit('close')">
    <template #title>{{ assignment.title }}</template>

    <p class="-mt-1 mb-5 text-xs text-ink-400">
      Created {{ formatRelative(assignment.createdAt) }}
    </p>

    <div class="space-y-6">
      <div>
        <label
          for="description"
          class="mb-1.5 block text-sm font-semibold text-ink-900"
        >
          Description
        </label>
        <textarea
          id="description"
          v-model.trim="assignment.description"
          rows="5"
          class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        />
      </div>

      <fieldset>
        <legend class="mb-2 text-sm font-semibold text-ink-900">
          Lottery entries
        </legend>
        <div class="space-y-3">
          <label class="flex items-center justify-between gap-4 text-sm">
            <span class="text-ink-600">Minimum each student must submit</span>
            <input
              v-model.number="assignment.minEntries"
              type="number"
              min="1"
              max="3"
              class="w-20 rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </label>
          <label class="flex items-center justify-between gap-4 text-sm">
            <span class="text-ink-600">Maximum each student can enter</span>
            <input
              v-model.number="assignment.maxEntries"
              type="number"
              min="3"
              max="5"
              class="w-20 rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </label>
        </div>
      </fieldset>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="emit('close')">Cancel</AppButton>
      <AppButton :disabled="saving" @click="updateAssignment">
        {{ saving ? 'Saving…' : 'Update' }}
      </AppButton>
    </template>
  </AppModal>
</template>
