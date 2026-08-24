<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  TicketIcon,
  ListBulletIcon,
  UsersIcon,
  PencilSquareIcon,
} from '@heroicons/vue/24/outline'
import AssignmentDataService from '@/services/AssignmentDataService'
import LotteryDataService from '@/services/LotteryDataService'
import { useAuthStore } from '@/stores/auth'
import { useAssignmentsStore } from '@/stores/assignments'
import { formatRelative, formatDate } from '@/lib/date'
import { lotteryState, studentGuidance } from '@/lib/lottery'
import AppButton from '@/components/AppButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import StudentLotteryPanel from '@/components/StudentLotteryPanel.vue'
import LotteryStatus from '@/components/LotteryStatus.vue'
import LotteryModal from '@/components/LotteryModal.vue'
import PoasList from '@/components/PoasList.vue'
import AssignmentModal from '@/components/AssignmentModal.vue'
import StudentsList from '@/components/StudentsList.vue'
import LotteryAdmin from '@/components/LotteryAdmin.vue'

const route = useRoute()
const auth = useAuthStore()
const assignments = useAssignmentsStore()

const isTeacher = computed(() => auth.role === 'ROLE_TEACHER')

const assignment = ref(null)
const lottery = ref(null)
const loading = ref(true)
const notFound = ref(false)

const showLottery = ref(false)
const showPoas = ref(false)
const showEdit = ref(false)
const showStudents = ref(false)
const showAdmin = ref(false)

const status = computed(() =>
  assignment.value ? lotteryState(assignment.value.state) : null,
)
const canEdit = computed(() =>
  assignment.value ? studentGuidance(assignment.value.state).canEdit : false,
)
const due = computed(() => formatDate(assignment.value?.dueDate))

async function load(id) {
  loading.value = true
  notFound.value = false
  lottery.value = null

  try {
    const response = await AssignmentDataService.get(id)
    if (!response.data?.assignmentId) {
      notFound.value = true
      return
    }
    assignment.value = response.data

    // The modals read the active assignment from the store.
    auth.updateActiveAssignment(response.data)
    assignments.upsert(response.data)

    if (!isTeacher.value) {
      const result = await LotteryDataService.getAll(id)
      lottery.value = result.data
    }
  } catch (e) {
    console.log(e)
    notFound.value = true
  } finally {
    loading.value = false
  }
}

// Reload when switching assignments from the sidebar.
watch(() => route.params.id, (id) => { if (id) load(id) })
onMounted(() => load(route.params.id))

function refreshStudent() {
  showLottery.value = false
  if (!isTeacher.value) load(route.params.id)
}

function closeAdmin() {
  showAdmin.value = false
  load(route.params.id)
}
</script>

<template>
  <div class="page">
    <div v-if="loading" class="card animate-pulse p-6" aria-hidden="true">
      <div class="h-6 w-1/3 rounded bg-ink-100" />
      <div class="mt-3 h-3 w-2/3 rounded bg-ink-100" />
      <div class="mt-6 h-9 w-48 rounded bg-ink-100" />
    </div>

    <EmptyState
      v-else-if="notFound"
      title="Assignment not found"
      description="It may have been removed, or you may not have access to it."
    />

    <article v-else class="card p-6 sm:p-7">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-display text-2xl font-semibold text-ink-900">
            {{ assignment.title }}
          </h2>
          <p class="mt-1 text-xs text-ink-400">
            Created {{ formatRelative(assignment.createdAt) }}
          </p>
        </div>
        <span class="badge shrink-0" :class="status.cls">{{ status.label }}</span>
      </div>

      <p
        v-if="assignment.description"
        class="mt-4 max-w-prose leading-relaxed text-ink-600"
      >
        {{ assignment.description }}
      </p>

      <dl class="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-500">
        <div class="flex gap-1.5">
          <dt class="font-semibold text-ink-600">Choices to submit</dt>
          <dd>{{ assignment.minEntries }}–{{ assignment.maxEntries }}</dd>
        </div>
        <div v-if="due" class="flex gap-1.5">
          <dt class="font-semibold text-ink-600">Teacher's deadline</dt>
          <dd>{{ due }}</dd>
        </div>
      </dl>

      <!-- Student: their own status, progress and result -->
      <StudentLotteryPanel
        v-if="!isTeacher"
        :assignment="assignment"
        :lottery="lottery"
      />

      <!-- Teacher: where the lottery stands -->
      <div v-else class="mt-5 border-t border-ink-100 pt-5">
        <LotteryStatus :state="assignment.state" role="teacher" />
      </div>

      <div class="mt-6 flex flex-wrap gap-2 border-t border-ink-100 pt-5">
        <template v-if="isTeacher">
          <AppButton variant="primary" @click="showAdmin = true">
            <TicketIcon class="h-4 w-4" aria-hidden="true" />
            Manage lottery
          </AppButton>
          <AppButton variant="secondary" @click="showStudents = true">
            <UsersIcon class="h-4 w-4" aria-hidden="true" />
            Students
          </AppButton>
          <AppButton variant="secondary" @click="showEdit = true">
            <PencilSquareIcon class="h-4 w-4" aria-hidden="true" />
            Edit
          </AppButton>
        </template>

        <template v-else>
          <AppButton variant="primary" @click="showLottery = true">
            <TicketIcon class="h-4 w-4" aria-hidden="true" />
            {{ canEdit ? 'Edit my choices' : 'View my choices' }}
          </AppButton>
          <AppButton variant="secondary" @click="showPoas = true">
            <ListBulletIcon class="h-4 w-4" aria-hidden="true" />
            POAS taken
          </AppButton>
        </template>
      </div>
    </article>

    <LotteryModal v-if="showLottery" @close="refreshStudent" />
    <PoasList v-if="showPoas" @close="showPoas = false" />
    <AssignmentModal v-if="showEdit" @close="showEdit = false; load(route.params.id)" />
    <StudentsList v-if="showStudents" @close="showStudents = false" />
    <LotteryAdmin v-if="showAdmin" @close="closeAdmin" />
  </div>
</template>
