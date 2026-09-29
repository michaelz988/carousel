<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import TeacherDataService from '@/services/TeacherDataService'
import AdminDataService from '@/services/AdminDataService'
import { useAuthStore } from '@/stores/auth'
import { displayName } from '@/lib/user'
import { notify } from '@/lib/notify'
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UserAvatar from '@/components/UserAvatar.vue'

const props = defineProps({
  assignment: { type: Object, required: true },
})
// `gone`: the signed-in teacher left or deleted the assignment.
const emit = defineEmits(['close', 'gone'])

const auth = useAuthStore()
const assignmentId = computed(() => props.assignment.assignmentId)
const myId = computed(() => String(auth.activeUser.id))

const teachers = ref([])
const colleagues = ref([])
const loading = ref(true)

const isMe = (t) => String(t.userId) === myId.value
const owner = computed(() => teachers.value.find((t) => t.isOwner) ?? null)
const isOwner = computed(() => owner.value !== null && isMe(owner.value))
const me = computed(() => teachers.value.find(isMe) ?? null)
const others = computed(() => teachers.value.filter((t) => !isMe(t)))

function students(n) {
  return n === 1 ? '1 student' : `${n} students`
}

// The server enforces every rule below; these only explain it up front.
function removeBlocked(t) {
  return t.studentCount > 0
    ? `${displayName(t)} still has ${students(t.studentCount)} here. They need to remove their students first.`
    : ''
}
const leaveBlocked = computed(() =>
  me.value?.studentCount > 0
    ? `You still have ${students(me.value.studentCount)} here. Remove them from your student list first.`
    : '',
)
const deleteBlocked = computed(() =>
  others.value.length > 0
    ? 'Other teachers still share this assignment. Remove them first.'
    : '',
)

// --- adding --------------------------------------------------------------

const selected = ref(null)
const query = ref('')
const adding = ref(false)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return colleagues.value
  return colleagues.value.filter((t) =>
    `${displayName(t)} ${t.email}`.toLowerCase().includes(q),
  )
})

async function add() {
  if (!selected.value) return
  adding.value = true
  try {
    await TeacherDataService.addToAssignment(assignmentId.value, selected.value.userId)
    notify(`${displayName(selected.value)} can now manage this assignment.`, 'info')
    selected.value = null
    query.value = ''
    await load()
  } catch (e) {
    console.log(e)
  } finally {
    adding.value = false
  }
}

// --- remove / leave / transfer / delete ----------------------------------

// { kind: 'remove' | 'leave' | 'transfer' | 'delete', teacher? }
const pending = ref(null)
const working = ref(false)

async function confirmPending() {
  const { kind, teacher } = pending.value
  working.value = true
  try {
    if (kind === 'remove') {
      await TeacherDataService.removeFromAssignment(assignmentId.value, teacher.userId)
      notify(`${displayName(teacher)} was removed from this assignment.`, 'info')
      await load()
    } else if (kind === 'transfer') {
      await TeacherDataService.transferOwnership(assignmentId.value, teacher.userId)
      notify(`${displayName(teacher)} now owns this assignment.`, 'info')
      await load()
    } else if (kind === 'leave') {
      await TeacherDataService.removeFromAssignment(assignmentId.value, auth.activeUser.id)
      notify(`You left "${props.assignment.title}".`, 'info')
      emit('gone')
    } else if (kind === 'delete') {
      await TeacherDataService.delete(assignmentId.value)
      notify(`"${props.assignment.title}" was deleted.`, 'info')
      emit('gone')
    }
  } catch (e) {
    // The interceptor shows why; reload in case someone else changed things.
    console.log(e)
    await load()
  } finally {
    working.value = false
    pending.value = null
  }
}

async function load() {
  try {
    // Admins are never members, so they read it through the admin endpoint and
    // see no owner controls.
    const service = auth.role === 'ROLE_ADMIN' ? AdminDataService : TeacherDataService
    const response = await service.getAssignmentTeachers(assignmentId.value)
    teachers.value = response.data
    colleagues.value = isOwner.value
      ? (await TeacherDataService.getColleagues(assignmentId.value)).data
      : []
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <AppModal title="Teachers" size="md" @close="emit('close')">
    <div v-if="loading" class="space-y-3" aria-hidden="true">
      <div v-for="n in 2" :key="n" class="h-12 animate-pulse rounded-xl bg-ink-100" />
    </div>

    <template v-else>
      <p class="text-sm text-ink-600">
        <template v-if="isOwner">
          You own this assignment. Teachers you add can manage its lottery and
          their own students.
        </template>
        <template v-else-if="owner">
          Owned by <strong class="font-semibold">{{ displayName(owner) }}</strong>.
          Only the owner can add or remove teachers.
        </template>
      </p>

      <!-- Owner: pick from existing teacher accounts -->
      <form v-if="isOwner" class="mt-4" @submit.prevent="add">
        <label class="mb-1.5 block text-xs font-semibold text-ink-600">
          Add a teacher
        </label>
        <p v-if="!colleagues.length" class="text-sm text-ink-500">
          Every teacher is already on this assignment.
        </p>
        <Combobox v-else v-model="selected" nullable>
          <div class="flex gap-2">
            <ComboboxInput
              class="min-w-0 flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              placeholder="Search by name or email"
              :display-value="(t) => (t ? displayName(t) : '')"
              @change="query = $event.target.value"
            />
            <AppButton type="submit" :disabled="!selected || adding">Add</AppButton>
          </div>
          <!-- In the flow, not floating: the modal body scrolls and would clip it -->
          <ComboboxOptions
            class="mt-1 max-h-56 overflow-y-auto rounded-xl border border-ink-200 bg-white py-1 focus:outline-none"
          >
            <li v-if="!filtered.length" class="px-3 py-2 text-sm text-ink-500">
              No teacher matches "{{ query }}".
            </li>
            <ComboboxOption
              v-for="t in filtered"
              :key="t.userId"
              v-slot="{ active, selected: isSelected }"
              :value="t"
              as="template"
            >
              <li
                class="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm"
                :class="active ? 'bg-brand-50' : ''"
              >
                <UserAvatar :user="t" :size="28" />
                <span class="min-w-0 flex-1">
                  <span class="block truncate" :class="isSelected && 'font-semibold'">
                    {{ displayName(t) }}
                  </span>
                  <span class="block truncate text-xs text-ink-500">{{ t.email }}</span>
                </span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </Combobox>
      </form>

      <!-- Everyone on the assignment -->
      <ul class="mt-5 divide-y divide-ink-100 border-y border-ink-100">
        <li v-for="t in teachers" :key="t.userId" class="flex items-center gap-3 py-3">
          <UserAvatar :user="isMe(t) ? auth.activeUser : t" :size="36" />
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-center gap-1.5 text-sm font-medium text-ink-900">
              {{ displayName(t) }}
              <span v-if="t.isOwner" class="badge bg-brand-100 text-brand-800">Owner</span>
              <span v-if="isMe(t)" class="badge bg-ink-100 text-ink-600">You</span>
            </p>
            <p class="truncate text-xs text-ink-500">
              {{ t.email }} · {{ students(t.studentCount) }}
            </p>
          </div>

          <template v-if="isOwner && !isMe(t)">
            <AppButton
              variant="ghost"
              size="sm"
              @click="pending = { kind: 'transfer', teacher: t }"
            >
              Make owner
            </AppButton>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full text-ink-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-500"
              :disabled="Boolean(removeBlocked(t))"
              :aria-label="`Remove ${displayName(t)}`"
              :title="removeBlocked(t) || 'Remove from this assignment'"
              @click="pending = { kind: 'remove', teacher: t }"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </template>
        </li>
      </ul>

      <p v-if="isOwner && others.some((t) => removeBlocked(t))" class="mt-2 text-xs text-ink-500">
        A teacher can't be removed while they still have students here.
      </p>
    </template>

    <template v-if="!loading" #footer>
      <div class="flex w-full flex-wrap items-center gap-3">
        <template v-if="isOwner">
          <AppButton
            variant="danger"
            size="sm"
            :disabled="Boolean(deleteBlocked)"
            @click="pending = { kind: 'delete' }"
          >
            Delete assignment
          </AppButton>
          <span v-if="deleteBlocked" class="text-xs text-ink-500">{{ deleteBlocked }}</span>
        </template>
        <template v-else-if="me">
          <AppButton
            variant="secondary"
            size="sm"
            :disabled="Boolean(leaveBlocked)"
            @click="pending = { kind: 'leave' }"
          >
            Leave assignment
          </AppButton>
          <span v-if="leaveBlocked" class="text-xs text-ink-500">{{ leaveBlocked }}</span>
        </template>
      </div>
    </template>

    <ConfirmDialog
      v-if="pending"
      :title="
        {
          remove: 'Remove this teacher?',
          transfer: 'Transfer ownership?',
          leave: 'Leave this assignment?',
          delete: 'Delete this assignment?',
        }[pending.kind]
      "
      :confirm-label="
        {
          remove: 'Remove teacher',
          transfer: 'Make owner',
          leave: 'Leave assignment',
          delete: 'Delete assignment',
        }[pending.kind]
      "
      :variant="pending.kind === 'transfer' ? 'primary' : 'danger'"
      :busy="working"
      @cancel="pending = null"
      @confirm="confirmPending"
    >
      <p v-if="pending.kind === 'remove'">
        <strong>{{ displayName(pending.teacher) }}</strong> will no longer see
        this assignment or manage its lottery.
      </p>
      <p v-else-if="pending.kind === 'transfer'">
        <strong>{{ displayName(pending.teacher) }}</strong> will own this
        assignment. You will stay on it as a teacher, but only they will be able
        to add or remove teachers or delete it.
      </p>
      <p v-else-if="pending.kind === 'leave'">
        You will no longer see <strong>{{ assignment.title }}</strong>. The
        owner can add you back.
      </p>
      <template v-else-if="pending.kind === 'delete'">
        <p>
          This deletes <strong>{{ assignment.title }}</strong>
          <template v-if="me?.studentCount">
            along with your {{ students(me.studentCount) }} on it and all of
            their choices
          </template>.
        </p>
        <p class="mt-2">This cannot be undone.</p>
      </template>
    </ConfirmDialog>
  </AppModal>
</template>
