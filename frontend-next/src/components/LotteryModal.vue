<script setup>
import { computed, onMounted, ref } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import AssignmentDataService from '@/services/AssignmentDataService'
import LotteryDataService from '@/services/LotteryDataService'
import { useAuthStore } from '@/stores/auth'
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'
import { formatRelative } from '@/lib/date'

const props = defineProps({
  // When a teacher opens a student's entries, this is that student's id.
  student: { type: [Number, String], default: null },
})
const emit = defineEmits(['close'])

const auth = useAuthStore()

const lotteryEntries = ref([])
const poasStats = ref([])
const poasAssigned = ref(0)
const saving = ref(false)

const activeAssignment = computed(() => auth.activeAssignment)

const isMaxEntries = computed(
  () => lotteryEntries.value.length >= activeAssignment.value.maxEntries,
)

const delDisabled = computed(
  () => lotteryEntries.value.length <= activeAssignment.value.minEntries,
)

const submitDisabled = computed(() => {
  if (saving.value) return true
  for (const entry of lotteryEntries.value) {
    if (!entry.name) return true
    if (!entry.biography || entry.biography.length <= 1) return true
    if (!entry.statement || entry.statement.length <= 1) return true
  }
  return false
})

const isLocked = computed(() => {
  // A teacher viewing someone else's entries is never locked out.
  if (props.student != null && auth.activeUser.id != props.student) return false

  const state = activeAssignment.value.state
  return state > 0 && !(state === 2 && poasAssigned.value === 0)
})

function isInvalid(entry) {
  return (
    entry.name === '*** POAS NOT FOUND ***' ||
    entry.name === '*** AMBIGUOUS ENTRY ***'
  )
}

function addEntry() {
  lotteryEntries.value.push({
    name: '',
    wikiLink: '',
    wikiDescription: '',
    biography: '',
    statement: '',
    preference: lotteryEntries.value.length + 1,
  })
}

function delEntry(index) {
  lotteryEntries.value.splice(index, 1)
  poasStats.value.splice(index, 1)
  for (let i = index; i < lotteryEntries.value.length; i++) {
    lotteryEntries.value[i].preference = lotteryEntries.value[i].preference - 1
  }
}

function refresh(result) {
  poasAssigned.value = result.data.poasAssigned
  lotteryEntries.value = result.data.lotteries
  poasStats.value = result.data.poasStats
  let count = lotteryEntries.value.length
  while (count < activeAssignment.value.minEntries) {
    addEntry()
    count++
  }
}

async function submitEntries() {
  saving.value = true
  try {
    await LotteryDataService.create(
      activeAssignment.value.assignmentId,
      lotteryEntries.value,
      props.student,
    )
    const result = await LotteryDataService.getAll(
      activeAssignment.value.assignmentId,
      props.student,
    )
    refresh(result)
  } catch (e) {
    console.log(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const response = await AssignmentDataService.get(
      activeAssignment.value.assignmentId,
    )
    auth.updateActiveAssignment(response.data)

    const result = props.student
      ? await LotteryDataService.getAll(
          activeAssignment.value.assignmentId,
          props.student,
        )
      : await LotteryDataService.getAll(activeAssignment.value.assignmentId)
    refresh(result)
  } catch (e) {
    console.log(e)
  }
})

function close() {
  lotteryEntries.value = []
  emit('close')
}
</script>

<template>
  <AppModal size="lg" @close="close">
    <template #title>{{ activeAssignment.title }}</template>

    <header class="mb-6">
      <p class="text-xs text-ink-400">
        Created {{ formatRelative(activeAssignment.createdAt) }}
      </p>
      <p
        v-if="activeAssignment.description"
        class="mt-2 text-sm leading-relaxed text-ink-600"
      >
        {{ activeAssignment.description }}
      </p>
      <a
        href="https://www.code4real.org/projects/student-instructions/"
        target="_blank"
        class="mt-3 inline-block text-sm font-medium text-brand-700 underline underline-offset-4 hover:text-brand-800"
      >
        How to enter your POAS choices
      </a>
    </header>

    <div
      v-if="isLocked"
      class="mb-5 rounded-lg border border-accent-gold-soft bg-accent-gold-soft/60 px-4 py-3 text-sm text-accent-gold"
    >
      Entries are locked — the lottery has already been run or is in progress.
    </div>

    <form class="space-y-4" @submit.prevent>
      <fieldset
        v-for="(entry, index) in lotteryEntries"
        :key="index"
        class="rounded-xl border border-ink-200 bg-ink-50/40 p-4 sm:p-5"
      >
        <div class="mb-3 flex items-start justify-between gap-3">
          <legend class="text-sm font-semibold text-ink-900">
            Choice {{ index + 1 }}
          </legend>
          <div class="flex shrink-0 items-center gap-2">
            <span
              v-if="index + 1 === poasAssigned"
              class="badge bg-brand-600 text-white"
            >
              Assigned
            </span>
            <AppButton
              v-if="!isLocked"
              variant="danger"
              size="sm"
              :disabled="delDisabled"
              @click="delEntry(index)"
            >
              <TrashIcon class="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </AppButton>
          </div>
        </div>

        <label class="mb-1.5 block text-xs font-semibold text-ink-600">
          Person of American Significance (commonly known name)
        </label>
        <input
          v-model.trim.lazy="entry.name"
          type="text"
          maxlength="100"
          placeholder="e.g. Harriet Tubman"
          :disabled="isLocked"
          class="w-full rounded-lg border px-3 py-2 text-sm transition focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:bg-ink-100 disabled:text-ink-500"
          :class="
            isInvalid(entry)
              ? 'border-red-400 text-red-700'
              : 'border-ink-200 focus:border-brand-500'
          "
        />

        <p
          v-if="poasStats[index] && poasStats[index][0] === -1"
          class="mt-1.5 text-xs font-semibold text-red-600"
        >
          Already taken
        </p>
        <p v-else-if="poasStats[index]" class="mt-1.5 flex flex-wrap gap-x-3 text-xs text-ink-500">
          <span
            v-for="(count, preference) in poasStats[index]"
            :key="preference"
          >
            Option {{ preference + 1 }}: {{ count }}
          </span>
        </p>

        <p v-if="entry.wikiLink" class="mt-2 text-xs">
          <a
            :href="entry.wikiLink"
            target="_blank"
            class="text-brand-700 underline underline-offset-2"
          >
            Wikipedia page
          </a>
        </p>
        <p v-if="entry.wikiDescription" class="mt-1 text-xs text-ink-500">
          {{ entry.wikiDescription }}…
        </p>

        <label class="mt-4 mb-1.5 block text-xs font-semibold text-ink-600">
          Title of the (auto)biography
          <span class="font-normal text-ink-400">(max 100 characters)</span>
        </label>
        <input
          v-model.lazy="entry.biography"
          type="text"
          maxlength="100"
          :disabled="isLocked"
          class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:bg-ink-100 disabled:text-ink-500"
        />

        <label class="mt-4 mb-1.5 block text-xs font-semibold text-ink-600">
          Statement of significance
          <span class="font-normal text-ink-400">(max 250 characters)</span>
        </label>
        <textarea
          v-model.lazy="entry.statement"
          rows="2"
          maxlength="250"
          :disabled="isLocked"
          class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:bg-ink-100 disabled:text-ink-500"
        />
      </fieldset>
    </form>

    <template v-if="!isLocked" #footer>
      <AppButton variant="secondary" :disabled="isMaxEntries" @click="addEntry">
        Add an entry
      </AppButton>
      <AppButton :disabled="submitDisabled" @click="submitEntries">
        {{ saving ? 'Saving…' : 'Save' }}
      </AppButton>
    </template>
  </AppModal>
</template>
