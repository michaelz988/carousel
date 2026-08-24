<script setup>
import { computed, onMounted, ref } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import TeacherDataService from '@/services/TeacherDataService'
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import DataTable from '@/components/DataTable.vue'
import { notify } from '@/lib/notify'

const emit = defineEmits(['close'])

// ToDo (carried over): school is hard coded to American High School (id 1).
const SCHOOL_ID = 1

const fields = [
  'index',
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'username', label: 'User Name' },
  { key: 'actions', label: '' },
]

const teachers = ref([])
const email = ref('')
const busy = ref(true)
const working = ref(false)

// Which removal is awaiting confirmation: a teacher object, 'all', or null.
const pending = ref(null)

const pendingName = computed(() => {
  const t = pending.value
  if (!t || t === 'all') return ''
  const full = [t.firstName, t.lastName].filter(Boolean).join(' ')
  return full || t.username || t.email || 'this teacher'
})

function retrieveTeachers(schoolId) {
  busy.value = true
  return TeacherDataService.getAllTeachers(schoolId)
    .then((response) => {
      teachers.value = response.data
    })
    .catch((e) => console.log(e))
    .finally(() => {
      busy.value = false
    })
}

function addTeacher() {
  if (!email.value) return
  TeacherDataService.addTeacher(SCHOOL_ID, { email: email.value })
    .then((response) => {
      if (response.data) {
        teachers.value.push(response.data)
        notify(`${email.value} added as a teacher.`, 'info')
      } else {
        notify('That account is already registered.', 'info')
      }
      email.value = ''
    })
    .catch((e) => console.log(e))
}

async function confirmRemoval() {
  const target = pending.value
  if (!target) return

  working.value = true
  try {
    if (target === 'all') {
      await TeacherDataService.deleteAllTeachers(SCHOOL_ID)
      teachers.value = []
      notify('All teachers removed.', 'info')
    } else {
      await TeacherDataService.deleteTeacher(target.userId)
      teachers.value = teachers.value.filter((t) => t.userId !== target.userId)
      notify(`${pendingName.value} removed.`, 'info')
    }
  } catch (e) {
    console.log(e)
    notify('Could not remove the teacher.')
  } finally {
    working.value = false
    pending.value = null
  }
}

onMounted(() => retrieveTeachers(SCHOOL_ID))
</script>

<template>
  <AppModal title="Teachers" size="lg" @close="emit('close')">
    <form class="mb-4 flex gap-2" @submit.prevent="addTeacher">
      <input
        v-model.trim="email"
        type="email"
        maxlength="64"
        placeholder="teacher's email"
        class="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
      />
      <AppButton type="submit" :disabled="!email">Add teacher</AppButton>
    </form>

    <DataTable
      :items="teachers"
      :fields="fields"
      :busy="busy"
      empty-text="No teachers registered yet."
    >
      <template #cell(actions)="{ item }">
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full text-ink-500 transition hover:bg-red-50 hover:text-red-700"
          :aria-label="`Remove ${item.username || item.email}`"
          title="Remove teacher"
          @click.stop="pending = item"
        >
          <TrashIcon class="h-4 w-4" />
        </button>
      </template>
    </DataTable>

    <template #footer>
      <AppButton
        variant="danger"
        size="sm"
        :disabled="!teachers.length"
        @click="pending = 'all'"
      >
        Remove all
      </AppButton>
    </template>

    <ConfirmDialog
      v-if="pending"
      :title="pending === 'all' ? 'Remove every teacher?' : 'Remove this teacher?'"
      :confirm-label="pending === 'all' ? 'Remove all teachers' : 'Remove teacher'"
      variant="danger"
      :busy="working"
      @cancel="pending = null"
      @confirm="confirmRemoval"
    >
      <p v-if="pending === 'all'">
        This deletes all
        <strong>{{ teachers.length }}</strong>
        teacher {{ teachers.length === 1 ? 'account' : 'accounts' }} and
        everything attached to them, including their assignments.
      </p>
      <p v-else>
        This deletes <strong>{{ pendingName }}</strong
        >'s account and everything attached to it, including any assignments
        they own.
      </p>
      <p class="mt-2">This cannot be undone.</p>
    </ConfirmDialog>
  </AppModal>
</template>
