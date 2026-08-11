<script setup>
import { onMounted, ref } from 'vue'
import { ArrowUpTrayIcon } from '@heroicons/vue/24/outline'
import StudentDataService from '@/services/StudentDataService'
import { useAuthStore } from '@/stores/auth'
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'
import DataTable from '@/components/DataTable.vue'
import StudentsImport from '@/components/StudentsImport.vue'
import { notify } from '@/lib/notify'

const emit = defineEmits(['close'])
const auth = useAuthStore()

const fields = [
  'index',
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'username', label: 'User Name' },
  {
    key: 'period',
    label: 'Period',
    sortable: true,
    sortByFormatted: (value, key, item) => item.period,
  },
]

const students = ref([])
const currentStudent = ref(null)
const busy = ref(true)
const showImport = ref(false)

function retrieveStudents(assignmentId) {
  busy.value = true
  return StudentDataService.getAll(assignmentId)
    .then((response) => {
      students.value = response.data
    })
    .catch((e) => console.log(e))
    .finally(() => {
      busy.value = false
    })
}

function refreshList() {
  retrieveStudents(auth.activeAssignment.assignmentId)
  currentStudent.value = null
}

function onStudentSelected(items) {
  currentStudent.value = items[0] ?? null
}

function removeAllStudents() {
  if (
    !window.confirm(
      'All registered students will be removed from this assignment. Are you sure?',
    )
  )
    return

  StudentDataService.deleteAll(auth.activeAssignment.assignmentId)
    .then(() => refreshList())
    .catch((e) => console.log(e))
}

// The upload endpoint only returns a message string — it reports no row counts,
// duplicates or failures. Rather than invent a breakdown, report the one thing
// that is genuinely knowable: how much the roster actually grew.
async function closeImport() {
  const before = students.value.length
  showImport.value = false
  await retrieveStudents(auth.activeAssignment.assignmentId)
  currentStudent.value = null

  const added = students.value.length - before
  if (added > 0) {
    notify(
      `${added} ${added === 1 ? 'student' : 'students'} added to the roster.`,
      'info',
    )
  } else {
    notify(
      'No new students were added. They may already be on the roster, or the file may not have matched the expected format.',
      'info',
    )
  }
}

onMounted(() => retrieveStudents(auth.activeAssignment.assignmentId))
</script>

<template>
  <AppModal title="Students" size="xl" @close="emit('close')">
    <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div>
        <DataTable
          :items="students"
          :fields="fields"
          :busy="busy"
          selectable
          empty-text="No students have been imported for this assignment."
          @row-selected="onStudentSelected"
        >
          <template #cell(firstName)="{ item }">
            {{ item.Student?.firstName ?? '' }}
          </template>
          <template #cell(lastName)="{ item }">
            {{ item.Student?.lastName ?? '' }}
          </template>
          <template #cell(username)="{ item }">
            {{ item.Student?.username ?? '' }}
          </template>
        </DataTable>

        <div class="mt-4 flex flex-wrap gap-2">
          <AppButton variant="secondary" size="sm" @click="showImport = true">
            <ArrowUpTrayIcon class="h-4 w-4" aria-hidden="true" />
            Import students
          </AppButton>
          <AppButton variant="danger" size="sm" @click="removeAllStudents">
            Remove all
          </AppButton>
        </div>
      </div>

      <aside class="card h-fit p-5">
        <h3 class="font-display text-base font-semibold">Selected student</h3>
        <dl v-if="currentStudent" class="mt-3 space-y-2 text-sm">
          <div>
            <dt class="text-ink-500">Name</dt>
            <dd class="font-medium text-ink-900">
              {{ currentStudent.Student?.firstName ?? currentStudent.firstName }}
              {{ currentStudent.Student?.lastName ?? currentStudent.lastName }}
            </dd>
          </div>
          <div>
            <dt class="text-ink-500">Email</dt>
            <dd class="break-all font-medium text-ink-900">
              {{ currentStudent.Student?.email ?? currentStudent.email }}
            </dd>
          </div>
        </dl>
        <p v-else class="mt-3 text-sm text-ink-500">
          Select a student to see their details.
        </p>
      </aside>
    </div>

    <StudentsImport v-if="showImport" @close="closeImport" />
  </AppModal>
</template>
