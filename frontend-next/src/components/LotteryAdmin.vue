<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowPathIcon, ClipboardIcon } from '@heroicons/vue/24/outline'
import AssignmentDataService from '@/services/AssignmentDataService'
import TeacherDataService from '@/services/TeacherDataService'
import { useAuthStore } from '@/stores/auth'
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'
import DataTable from '@/components/DataTable.vue'
import LotteryModal from '@/components/LotteryModal.vue'
import { notify } from '@/lib/notify'

const emit = defineEmits(['close'])
const auth = useAuthStore()

const LOTTERY_STEPS = ['Open', 'Locked', 'In progress', 'Completed']

const fields = [
  'index',
  {
    key: 'student',
    label: 'Student',
    sortable: true,
    sortByFormatted: (v, k, item) => item.Student?.lastName ?? '',
  },
  {
    key: 'teacher',
    label: 'Teacher',
    sortable: true,
    sortByFormatted: (v, k, item) => item.ClassTeacher?.Teacher?.lastName ?? '',
    filterByFormatted: (v, k, item) =>
      item.ClassTeacher?.Teacher?.lastName ?? '',
  },
  {
    key: 'period',
    label: 'Period',
    sortable: true,
    sortByFormatted: (v, k, item) => item.period,
  },
  {
    key: 'poas',
    label: 'POAS assigned',
    sortable: true,
    sortByFormatted: (v, k, item) => (item.poa ? item.poa.name : ''),
  },
  { key: 'show_details', label: '' },
]

const students = ref([])
const currentStudent = ref(null)
const isBusy = ref(false)
const filter = ref('')
const detailShowing = ref(false)
const tableRef = ref(null)

const state = computed(() => auth.activeAssignment.state)

function retrieveLotteryResult(assignmentId) {
  return TeacherDataService.showLottery(assignmentId)
    .then((response) => {
      students.value = response.data
      detailShowing.value = false
    })
    .catch((e) => console.log(e))
}

async function refreshList() {
  isBusy.value = true
  await retrieveLotteryResult(auth.activeAssignment.assignmentId)
  isBusy.value = false
  currentStudent.value = null
}

async function lockLottery() {
  const response = await TeacherDataService.lockLottery(
    auth.activeAssignment.assignmentId,
  )
  auth.updateActiveAssignment(response.data)
}

async function unlockLottery() {
  if (!window.confirm('All assigned POAS will be lost. Are you sure?')) return
  isBusy.value = true
  const response = await TeacherDataService.unlockLottery(
    auth.activeAssignment.assignmentId,
  )
  auth.updateActiveAssignment(response.data)
  await refreshList()
}

async function runLottery() {
  isBusy.value = true
  const response = await TeacherDataService.runLottery(
    auth.activeAssignment.assignmentId,
  )
  auth.updateActiveAssignment(response.data)
  await refreshList()
}

async function resumeLottery() {
  isBusy.value = true
  const response = await TeacherDataService.resumeLottery(
    auth.activeAssignment.assignmentId,
  )
  auth.updateActiveAssignment(response.data)
  await refreshList()
}

function onStudentSelected(items) {
  currentStudent.value = items[0] ?? null
}

function toggleDetails() {
  if (detailShowing.value) {
    tableRef.value?.collapseAll()
    detailShowing.value = false
  } else {
    tableRef.value?.expandAll()
    detailShowing.value = true
  }
}

async function copyResults() {
  const header = ['#', 'Student', 'Teacher', 'Period', 'POAS assigned']
  const lines = students.value.map((item, i) =>
    [
      i + 1,
      item.Student?.lastName
        ? `${item.Student.firstName} ${item.Student.lastName}`
        : item.Student?.username,
      item.ClassTeacher?.Teacher?.lastName ?? '',
      item.period ?? '',
      item.poa ? item.poa.name : `${item.lotteries?.length ?? 0} entries`,
    ].join('\t'),
  )
  const text = [header.join('\t'), ...lines].join('\n')

  try {
    await navigator.clipboard.writeText(text)
    notify('Lottery results copied to clipboard.', 'info')
  } catch {
    notify('Could not copy to clipboard.')
  }
}

onMounted(async () => {
  try {
    const response = await AssignmentDataService.get(
      auth.activeAssignment.assignmentId,
    )
    auth.updateActiveAssignment(response.data)
    await retrieveLotteryResult(auth.activeAssignment.assignmentId)
  } catch (e) {
    console.log(e)
  }
})
</script>

<template>
  <AppModal title="Lottery administration" size="xl" @close="emit('close')">
    <!-- Progress steps -->
    <ol class="mb-6 flex items-center gap-2" aria-label="Lottery progress">
      <li
        v-for="(step, i) in LOTTERY_STEPS"
        :key="step"
        class="flex flex-1 items-center gap-2"
      >
        <span
          class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition"
          :class="
            i <= state
              ? 'bg-brand-600 text-white'
              : 'border border-ink-200 bg-white text-ink-400'
          "
        >
          {{ i + 1 }}
        </span>
        <span
          class="hidden text-xs font-semibold sm:block"
          :class="i <= state ? 'text-brand-700' : 'text-ink-400'"
        >
          {{ step }}
        </span>
        <span
          v-if="i < LOTTERY_STEPS.length - 1"
          class="ml-1 h-px flex-1"
          :class="i < state ? 'bg-brand-500' : 'bg-ink-200'"
          aria-hidden="true"
        />
      </li>
    </ol>

    <!-- State actions -->
    <div class="mb-5 flex flex-wrap items-center gap-2">
      <template v-if="state === 0">
        <AppButton @click="lockLottery">Lock lottery entries</AppButton>
      </template>
      <template v-else-if="state === 1">
        <AppButton @click="runLottery">Run lottery</AppButton>
        <AppButton variant="secondary" @click="unlockLottery">
          Reopen lottery
        </AppButton>
      </template>
      <template v-else-if="state === 2">
        <AppButton @click="resumeLottery">Resume lottery</AppButton>
        <AppButton variant="secondary" @click="unlockLottery">
          Reopen lottery
        </AppButton>
      </template>
      <template v-else-if="state === 3">
        <AppButton variant="secondary" @click="unlockLottery">
          Reopen lottery
        </AppButton>
      </template>

      <AppButton variant="ghost" class="ml-auto" @click="refreshList">
        <ArrowPathIcon class="h-4 w-4" aria-hidden="true" />
        Refresh
      </AppButton>
    </div>

    <!-- Results toolbar -->
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <h3 class="font-display text-base font-semibold">Lottery result</h3>
      <div class="ml-auto flex flex-wrap items-center gap-2">
        <input
          v-model="filter"
          type="search"
          placeholder="Filter by teacher's last name"
          class="w-56 rounded-lg border border-ink-200 px-3 py-1.5 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        />
        <AppButton variant="secondary" size="sm" @click="toggleDetails">
          {{ detailShowing ? 'Hide all details' : 'Show all details' }}
        </AppButton>
        <AppButton variant="secondary" size="sm" @click="copyResults">
          <ClipboardIcon class="h-4 w-4" aria-hidden="true" />
          Copy
        </AppButton>
      </div>
    </div>

    <DataTable
      ref="tableRef"
      :items="students"
      :fields="fields"
      :busy="isBusy"
      :filter="filter"
      :filter-on="['teacher']"
      selectable
      empty-text="No students are registered for this assignment."
      @row-selected="onStudentSelected"
    >
      <template #cell(student)="{ item }">
        {{
          item.Student?.lastName
            ? `${item.Student.firstName} ${item.Student.lastName}`
            : item.Student?.username
        }}
      </template>
      <template #cell(teacher)="{ item }">
        {{ item.ClassTeacher?.Teacher?.lastName ?? '' }}
      </template>
      <template #cell(poas)="{ item }">
        <span v-if="item.poa" class="font-medium text-ink-900">
          {{ item.poa.name }}
        </span>
        <span v-else class="text-ink-400">
          {{ item.lotteries?.length ?? 0 }} entries
        </span>
      </template>
      <template #cell(show_details)="{ toggleDetails: toggle, detailsShowing }">
        <AppButton variant="ghost" size="sm" @click.stop="toggle()">
          {{ detailsShowing ? 'Hide' : 'Details' }}
        </AppButton>
      </template>

      <template #row-details="{ item }">
        <dl class="grid gap-2 text-sm sm:grid-cols-[120px_minmax(0,1fr)]">
          <dt class="font-semibold text-ink-600">Biography</dt>
          <dd class="text-ink-700">
            {{
              item.preferenceChosen
                ? item.lotteries[item.preferenceChosen - 1]?.biography
                : '—'
            }}
          </dd>
          <dt class="font-semibold text-ink-600">Significance</dt>
          <dd class="text-ink-700">
            {{
              item.preferenceChosen
                ? item.lotteries[item.preferenceChosen - 1]?.statement
                : '—'
            }}
          </dd>
        </dl>
      </template>
    </DataTable>

    <!-- Teacher drilling into one student's entries -->
    <LotteryModal
      v-if="currentStudent"
      :student="currentStudent.studentId"
      @close="currentStudent = null"
    />
  </AppModal>
</template>
