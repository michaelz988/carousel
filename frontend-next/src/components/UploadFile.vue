<script setup>
import { ref } from 'vue'
import UploadService from '@/services/UploadFileService'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/AppButton.vue'

const auth = useAuthStore()

const fileInput = ref(null)
const selectedFiles = ref(null)
const currentFile = ref(null)
const classPeriod = ref(1)
const progress = ref(0)
const message = ref('')
const failed = ref(false)

function selectFile() {
  selectedFiles.value = fileInput.value?.files ?? null
}

function upload() {
  if (!selectedFiles.value?.length) return

  progress.value = 0
  currentFile.value = selectedFiles.value.item(0)

  UploadService.upload(
    currentFile.value,
    auth.activeAssignment.assignmentId,
    classPeriod.value,
    (event) => {
      progress.value = event.total
        ? Math.round((100 * event.loaded) / event.total)
        : 0
    },
  )
    .then((response) => {
      message.value = response.data.message
      failed.value = false
    })
    .catch(() => {
      progress.value = 0
      message.value = 'Could not upload the file.'
      failed.value = true
      currentFile.value = null
    })

  selectedFiles.value = null
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label
        for="roster-file"
        class="mb-1.5 block text-sm font-semibold text-ink-900"
      >
        Roster file
      </label>
      <input
        id="roster-file"
        ref="fileInput"
        type="file"
        class="block w-full cursor-pointer rounded-lg border border-ink-200 text-sm text-ink-600 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-ink-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-ink-700 hover:file:bg-ink-100"
        @change="selectFile"
      />
    </div>

    <label class="flex items-center justify-between gap-4 text-sm">
      <span class="font-semibold text-ink-900">Class period</span>
      <input
        v-model.number="classPeriod"
        type="number"
        min="1"
        max="6"
        class="w-20 rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
      />
    </label>

    <div v-if="currentFile" class="h-2 overflow-hidden rounded-full bg-ink-100">
      <div
        class="h-full rounded-full bg-brand-600 transition-all"
        :style="{ width: progress + '%' }"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>

    <AppButton :disabled="!selectedFiles" @click="upload">Upload</AppButton>

    <p
      v-if="message"
      class="rounded-lg border px-3 py-2 text-sm"
      :class="
        failed
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-brand-200 bg-brand-50 text-brand-800'
      "
      role="status"
    >
      {{ message }}
    </p>

    <p class="text-xs leading-relaxed text-ink-400">
      Close this dialog when you're done — the roster will refresh and show how
      many students were added.
    </p>
  </div>
</template>
