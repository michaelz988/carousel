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
import LotteryStatus from '@/components/LotteryStatus.vue'
import LotteryPreflight from '@/components/LotteryPreflight.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { notify } from '@/lib/notify'
import { COMPLETED, submissionProgress } from '@/lib/lottery'

const emit = defineEmits(['close'])
const auth = useAuthStore()

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

// Which destructive action is awaiting confirmation: 'lock' | 'reopen' | null
const pendingAction = ref(null)
const actionBusy = ref(false)

// Students in the signed-in teacher's own sections, used to warn about
// unsubmitted work before locking. Scoped deliberately — see LotteryPreflight.
const myStudents = computed(() =>
  students.value.filter((s) => {
    const t = s.ClassTeacher?.Teacher
    return String(t?.userId ?? t?.id) === String(auth.activeUser.id)
  }),
)

const notReadyCount = computed(
  () =>
    myStudents.value.filter(
      (s) =>
        !submissionProgress(s.lotteries ?? [], auth.activeAssignment.minEntries)
          .complete,
    ).length,
)

const assignedCount = computed(
  () => students.value.filter((s) => s.poa).length,
)

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

// Locking is gated when students still have incomplete submissions, so it is
// a deliberate choice rather than a click.
function requestLock() {
  if (notReadyCount.value > 0) {
    pendingAction.value = 'lock'
    return
  }
  lockLottery()
}

async function lockLottery() {
  actionBusy.value = true
  try {
    const response = await TeacherDataService.lockLottery(
      auth.activeAssignment.assignmentId,
    )
    auth.updateActiveAssignment(response.data)
  } finally {
    actionBusy.value = false
    pendingAction.value = null
  }
}

function requestReopen() {
  pendingAction.value = 'reopen'
}

async function unlockLottery() {
  actionBusy.value = true
  isBusy.value = true
  try {
    const response = await TeacherDataService.unlockLottery(
      auth.activeAssignment.assignmentId,
    )
    auth.updateActiveAssignment(response.data)
    await refreshList()
  } finally {
    actionBusy.value = false
    pendingAction.value = null
  }
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
    <!-- Shared lifecycle rail + what this state means for a teacher -->
    <LotteryStatus :state="state" role="teacher" class="mb-5" />

    <LotteryPreflight
      v-if="state !== COMPLETED"
      class="mb-5"
      :students="students"
      :min-entries="auth.activeAssignment.minEntries"
      :teacher-id="auth.activeUser.id"
    />

    <!-- State actions -->
    <div class="mb-5 flex flex-wrap items-center gap-2">
      <template v-if="state === 0">
        <AppButton @click="requestLock">Lock lottery entries</AppButton>
      </template>
      <template v-else-if="state === 1">
        <AppButton @click="runLottery">Run lottery</AppButton>
        <AppButton variant="secondary" @click="requestReopen">
          Reopen lottery
        </AppButton>
      </template>
      <template v-else-if="state === 2">
        <AppButton @click="resumeLottery">Resume lottery</AppButton>
        <AppButton variant="secondary" @click="requestReopen">
          Reopen lottery
        </AppButton>
      </template>
      <template v-else-if="state === 3">
        <AppButton variant="secondary" @click="requestReopen">
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

  </AppModal>

  <!--
    Rendered as siblings of the modal, not children. Nesting one Headless UI
    Dialog inside another left focus on <body> when the inner one closed, so
    Escape no longer reached the outer dialog and keyboard users were stuck
    in it.
  -->
  <LotteryModal
    v-if="currentStudent"
    :student="currentStudent.studentId"
    @close="currentStudent = null"
  />

  <ConfirmDialog
      v-if="pendingAction === 'lock'"
      title="Lock entries before everyone has submitted?"
      confirm-label="Lock entries anyway"
      variant="danger"
      :busy="actionBusy"
      @cancel="pendingAction = null"
      @confirm="lockLottery"
    >
      <p>
        <strong>{{ notReadyCount }}</strong>
        of your students
        {{ notReadyCount === 1 ? 'has' : 'have' }}
        not finished submitting their choices.
      </p>
      <p class="mt-2">
        Locking now stops them editing, and they will take part in the lottery
        with whatever they have saved so far.
      </p>
    </ConfirmDialog>

    <ConfirmDialog
      v-if="pendingAction === 'reopen'"
      title="Reopen the lottery?"
      confirm-label="Reopen and clear assignments"
      variant="danger"
      :busy="actionBusy"
      @cancel="pendingAction = null"
      @confirm="unlockLottery"
    >
      <p>
        This clears
        <strong>
          {{ assignedCount }}
          {{ assignedCount === 1 ? 'assignment' : 'assignments' }}
        </strong>
        and reopens entries for editing.
      </p>
      <p v-if="state === COMPLETED" class="mt-2">
        Students have already been able to see which POAS they received. If you
        reopen, those results disappear and may change when you run the lottery
        again — you will probably want to tell them.
      </p>
  </ConfirmDialog>
</template>
