<script setup>
import { onMounted, ref } from 'vue'
import PoasDataService from '@/services/PoasDataService'
import { useAuthStore } from '@/stores/auth'
import AppModal from '@/components/AppModal.vue'
import DataTable from '@/components/DataTable.vue'

const emit = defineEmits(['close'])
const auth = useAuthStore()

const fields = ['index', { key: 'name', sortable: true }]
const poases = ref([])
const currentPoas = ref(null)
const busy = ref(true)

function retrievePoases(assignmentId) {
  busy.value = true
  PoasDataService.getAssigned(assignmentId)
    .then((response) => {
      poases.value = response.data
    })
    .catch((e) => console.log(e))
    .finally(() => {
      busy.value = false
    })
}

function onPoasSelected(items) {
  currentPoas.value = items[0] ?? null
}

onMounted(() => retrievePoases(auth.activeAssignment.assignmentId))
</script>

<template>
  <AppModal title="POAS already taken" size="xl" @close="emit('close')">
    <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <DataTable
        :items="poases"
        :fields="fields"
        :busy="busy"
        selectable
        empty-text="No POAS have been assigned yet."
        @row-selected="onPoasSelected"
      />

      <aside class="card h-fit p-5">
        <h3 class="font-display text-base font-semibold">Selected</h3>
        <div v-if="currentPoas" class="mt-3 space-y-1 text-sm">
          <p class="font-medium text-ink-900">{{ currentPoas.name }}</p>
          <p v-if="currentPoas.username" class="text-ink-500">
            Taken by {{ currentPoas.username }}
          </p>
        </div>
        <p v-else class="mt-3 text-sm text-ink-500">
          Select a row to see who claimed it.
        </p>
      </aside>
    </div>
  </AppModal>
</template>
