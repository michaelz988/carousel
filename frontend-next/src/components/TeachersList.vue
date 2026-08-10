<script setup>
import { onMounted, ref } from 'vue'
import TeacherDataService from '@/services/TeacherDataService'
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'
import DataTable from '@/components/DataTable.vue'

const emit = defineEmits(['close'])

// ToDo (carried over): school is hard coded to American High School (id 1).
const SCHOOL_ID = 1

const fields = ['index', 'firstName', 'lastName', 'username']
const teachers = ref([])
const currentTeacher = ref(null)
const email = ref('')
const busy = ref(true)

function retrieveTeachers(schoolId) {
  busy.value = true
  TeacherDataService.getAllTeachers(schoolId)
    .then((response) => {
      teachers.value = response.data
    })
    .catch((e) => console.log(e))
    .finally(() => {
      busy.value = false
    })
}

function onTeacherSelected(items) {
  currentTeacher.value = items[0] ?? null
}

function addTeacher() {
  if (!email.value) return
  TeacherDataService.addTeacher(SCHOOL_ID, { email: email.value })
    .then((response) => {
      if (response.data) teachers.value.push(response.data)
      email.value = ''
    })
    .catch((e) => console.log(e))
}

function removeAllTeachers() {
  if (
    !window.confirm(
      'All registered teachers will be removed from this school. Are you sure?',
    )
  )
    return

  TeacherDataService.deleteAllTeachers(SCHOOL_ID)
    .then(() => {
      teachers.value = []
      currentTeacher.value = null
    })
    .catch((e) => console.log(e))
}

onMounted(() => retrieveTeachers(SCHOOL_ID))
</script>

<template>
  <AppModal title="Teachers" size="xl" @close="emit('close')">
    <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div>
        <form class="mb-4 flex gap-2" @submit.prevent="addTeacher">
          <input
            v-model.trim="email"
            type="email"
            maxlength="64"
            placeholder="teacher's email"
            class="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          <AppButton type="submit" :disabled="!email">Add</AppButton>
        </form>

        <DataTable
          :items="teachers"
          :fields="fields"
          :busy="busy"
          selectable
          empty-text="No teachers registered yet."
          @row-selected="onTeacherSelected"
        />

        <div class="mt-4">
          <AppButton variant="danger" size="sm" @click="removeAllTeachers">
            Remove all
          </AppButton>
        </div>
      </div>

      <aside class="card h-fit p-5">
        <h3 class="font-display text-base font-semibold">Selected teacher</h3>
        <dl v-if="currentTeacher" class="mt-3 space-y-2 text-sm">
          <div>
            <dt class="text-ink-500">Name</dt>
            <dd class="font-medium text-ink-900">
              {{ currentTeacher.firstName }} {{ currentTeacher.lastName }}
            </dd>
          </div>
          <div>
            <dt class="text-ink-500">Email</dt>
            <dd class="break-all font-medium text-ink-900">
              {{ currentTeacher.email }}
            </dd>
          </div>
        </dl>
        <p v-else class="mt-3 text-sm text-ink-500">
          Select a teacher to see their details.
        </p>
      </aside>
    </div>
  </AppModal>
</template>
