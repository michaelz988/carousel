<script setup>
import { onMounted, ref } from 'vue'
import { TicketIcon, ListBulletIcon } from '@heroicons/vue/24/outline'
import AssignmentDataService from '@/services/AssignmentDataService'
import LotteryDataService from '@/services/LotteryDataService'
import { useAuthStore } from '@/stores/auth'
import AssignmentCard from '@/components/AssignmentCard.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import AppButton from '@/components/AppButton.vue'
import LotteryModal from '@/components/LotteryModal.vue'
import PoasList from '@/components/PoasList.vue'
import StudentLotteryPanel from '@/components/StudentLotteryPanel.vue'
import { studentGuidance } from '@/lib/lottery'

const auth = useAuthStore()

const assignments = ref([])
const loading = ref(true)
const showLottery = ref(false)
const showPoas = ref(false)

// Per-assignment lottery status, keyed by assignmentId, so the card can show
// submission progress and the final result without opening the entry form.
const lotteryByAssignment = ref({})

function loadLotteryStatus(assignment) {
  const id = assignment.assignmentId
  return LotteryDataService.getAll(id)
    .then((response) => {
      lotteryByAssignment.value = {
        ...lotteryByAssignment.value,
        [id]: response.data,
      }
    })
    .catch((e) => console.log(e))
}

function getAssignments() {
  loading.value = true
  AssignmentDataService.getAll()
    .then((response) => {
      assignments.value = response.data
      return Promise.all(response.data.map(loadLotteryStatus))
    })
    .catch((e) => console.log(e))
    .finally(() => {
      loading.value = false
    })
}

function canEdit(assignment) {
  return studentGuidance(assignment.state).canEdit
}

function editLottery(assignment) {
  auth.updateActiveAssignment(assignment)
  showLottery.value = true
}

function listPoas(assignment) {
  auth.updateActiveAssignment(assignment)
  showPoas.value = true
}

// Refresh status after the entry form closes so saved changes show immediately.
function closeLottery() {
  showLottery.value = false
  if (auth.activeAssignment?.assignmentId) {
    loadLotteryStatus(auth.activeAssignment)
  }
}

onMounted(getAssignments)
</script>

<template>
  <div class="page">
    <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
      <ProfileCard :user="auth.activeUser" :role="auth.role" />

      <div>
        <h1 class="mb-5 font-display text-2xl font-semibold">My assignments</h1>

        <!-- Loading skeletons -->
        <div v-if="loading" class="space-y-4" aria-hidden="true">
          <div v-for="n in 2" :key="n" class="card animate-pulse p-6">
            <div class="h-5 w-1/3 rounded bg-ink-100" />
            <div class="mt-3 h-3 w-2/3 rounded bg-ink-100" />
            <div class="mt-6 h-9 w-40 rounded bg-ink-100" />
          </div>
        </div>

        <div v-else-if="assignments.length" class="space-y-4">
          <AssignmentCard
            v-for="assignment in assignments"
            :key="assignment.assignmentId"
            :assignment="assignment"
          >
            <template #status>
              <StudentLotteryPanel
                :assignment="assignment"
                :lottery="lotteryByAssignment[assignment.assignmentId] ?? null"
              />
            </template>

            <template #actions>
              <AppButton variant="primary" @click="editLottery(assignment)">
                <TicketIcon class="h-4 w-4" aria-hidden="true" />
                {{ canEdit(assignment) ? 'Edit my choices' : 'View my choices' }}
              </AppButton>
              <AppButton variant="secondary" @click="listPoas(assignment)">
                <ListBulletIcon class="h-4 w-4" aria-hidden="true" />
                POAS taken
              </AppButton>
            </template>
          </AssignmentCard>
        </div>

        <EmptyState
          v-else
          title="No assignments yet"
          description="When your teacher opens an assignment, it will appear here and you can submit your POAS choices."
        />
      </div>
    </div>

    <LotteryModal v-if="showLottery" @close="closeLottery" />
    <PoasList v-if="showPoas" @close="showPoas = false" />
  </div>
</template>
