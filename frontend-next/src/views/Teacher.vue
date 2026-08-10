<script setup>
import { onMounted, ref } from 'vue'
import {
  PencilSquareIcon,
  UsersIcon,
  TicketIcon,
} from '@heroicons/vue/24/outline'
import TeacherDataService from '@/services/TeacherDataService'
import { useAuthStore } from '@/stores/auth'
import AssignmentCard from '@/components/AssignmentCard.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import AppButton from '@/components/AppButton.vue'
import AssignmentModal from '@/components/AssignmentModal.vue'
import StudentsList from '@/components/StudentsList.vue'
import LotteryAdmin from '@/components/LotteryAdmin.vue'

const auth = useAuthStore()

const assignments = ref([])
const loading = ref(true)
const showAssignment = ref(false)
const showStudents = ref(false)
const showLotteryAdmin = ref(false)

function getAssignments() {
  loading.value = true
  TeacherDataService.getAll()
    .then((response) => {
      assignments.value = response.data
    })
    .catch((e) => console.log(e))
    .finally(() => {
      loading.value = false
    })
}

function editAssignment(assignment) {
  auth.updateActiveAssignment(assignment)
  showAssignment.value = true
}

function manageStudents(assignment) {
  auth.updateActiveAssignment(assignment)
  showStudents.value = true
}

function adminLottery(assignment) {
  auth.updateActiveAssignment(assignment)
  showLotteryAdmin.value = true
}

onMounted(getAssignments)
</script>

<template>
  <div class="page">
    <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
      <ProfileCard :user="auth.activeUser" :role="auth.role" />

      <div>
        <h1 class="mb-5 font-display text-2xl font-semibold">Assignments</h1>

        <div v-if="loading" class="space-y-4" aria-hidden="true">
          <div v-for="n in 2" :key="n" class="card animate-pulse p-6">
            <div class="h-5 w-1/3 rounded bg-ink-100" />
            <div class="mt-3 h-3 w-2/3 rounded bg-ink-100" />
            <div class="mt-6 h-9 w-56 rounded bg-ink-100" />
          </div>
        </div>

        <div v-else-if="assignments.length" class="space-y-4">
          <AssignmentCard
            v-for="assignment in assignments"
            :key="assignment.assignmentId ?? assignment.id"
            :assignment="assignment"
          >
            <template #actions>
              <AppButton variant="primary" @click="adminLottery(assignment)">
                <TicketIcon class="h-4 w-4" aria-hidden="true" />
                Run lottery
              </AppButton>
              <AppButton variant="secondary" @click="manageStudents(assignment)">
                <UsersIcon class="h-4 w-4" aria-hidden="true" />
                Students
              </AppButton>
              <AppButton variant="secondary" @click="editAssignment(assignment)">
                <PencilSquareIcon class="h-4 w-4" aria-hidden="true" />
                Edit
              </AppButton>
            </template>
          </AssignmentCard>
        </div>

        <EmptyState
          v-else
          title="No assignments yet"
          description="Create an assignment to start collecting student POAS preferences."
        />
      </div>
    </div>

    <AssignmentModal v-if="showAssignment" @close="showAssignment = false" />
    <StudentsList v-if="showStudents" @close="showStudents = false" />
    <LotteryAdmin v-if="showLotteryAdmin" @close="showLotteryAdmin = false" />
  </div>
</template>
