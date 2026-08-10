<script setup>
import { computed, ref } from 'vue'
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'

/**
 * Replaces BootstrapVue's <b-table>, which is Vue 2 only.
 *
 * Supports the features the app actually used: declarative fields, sorting
 * (incl. sortByFormatted), text filtering scoped to chosen fields, single-row
 * selection, a busy state, and per-row expandable details.
 *
 * Cells are customisable with named slots: `cell(<key>)` receives
 * { item, index }, mirroring the old `#cell(key)="data"` API closely enough
 * that call sites read the same.
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  // [{ key, label?, sortable?, sortByFormatted?, filterByFormatted? }] or 'key'
  fields: { type: Array, required: true },
  selectable: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  filter: { type: String, default: '' },
  filterOn: { type: Array, default: () => [] },
  emptyText: { type: String, default: 'No records to show.' },
  maxHeight: { type: String, default: '60vh' },
})

const emit = defineEmits(['row-selected'])

const sortKey = ref(null)
const sortAsc = ref(true)
const selectedIndex = ref(null)
const expanded = ref(new Set())

const normalisedFields = computed(() =>
  props.fields.map((f) => (typeof f === 'string' ? { key: f } : f)),
)

function labelFor(field) {
  // Checked against undefined so an intentional empty label (e.g. an actions
  // column) renders blank instead of falling back to a derived key name.
  if (field.label !== undefined) return field.label
  if (field.key === 'index') return '#'
  // 'firstName' -> 'First Name'
  return field.key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

function rawValue(item, field, index) {
  if (field.key === 'index') return index + 1
  if (typeof field.sortByFormatted === 'function') {
    return field.sortByFormatted(item[field.key], field.key, item)
  }
  return item[field.key]
}

function filterValue(item, field) {
  if (typeof field.filterByFormatted === 'function') {
    return field.filterByFormatted(item[field.key], field.key, item)
  }
  if (typeof field.sortByFormatted === 'function') {
    return field.sortByFormatted(item[field.key], field.key, item)
  }
  return item[field.key]
}

const filtered = computed(() => {
  const q = (props.filter || '').trim().toLowerCase()
  if (!q) return props.items

  const targets = props.filterOn.length
    ? normalisedFields.value.filter((f) => props.filterOn.includes(f.key))
    : normalisedFields.value

  return props.items.filter((item) =>
    targets.some((f) =>
      String(filterValue(item, f) ?? '')
        .toLowerCase()
        .includes(q),
    ),
  )
})

const rows = computed(() => {
  if (!sortKey.value) return filtered.value
  const field = normalisedFields.value.find((f) => f.key === sortKey.value)
  if (!field) return filtered.value

  return [...filtered.value].sort((a, b) => {
    const av = rawValue(a, field, 0)
    const bv = rawValue(b, field, 0)
    if (av == null) return 1
    if (bv == null) return -1
    const res =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortAsc.value ? res : -res
  })
})

function toggleSort(field) {
  if (!field.sortable) return
  if (sortKey.value === field.key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = field.key
    sortAsc.value = true
  }
}

function selectRow(item, index) {
  if (!props.selectable) return
  if (selectedIndex.value === index) {
    selectedIndex.value = null
    emit('row-selected', [])
  } else {
    selectedIndex.value = index
    emit('row-selected', [item])
  }
}

function toggleDetails(index) {
  const next = new Set(expanded.value)
  next.has(index) ? next.delete(index) : next.add(index)
  expanded.value = next
}

function expandAll() {
  expanded.value = new Set(rows.value.map((_, i) => i))
}

function collapseAll() {
  expanded.value = new Set()
}

defineExpose({ expandAll, collapseAll })
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-ink-200 bg-white">
    <div class="overflow-auto" :style="{ maxHeight }">
      <table class="w-full border-collapse text-left text-sm">
        <thead class="sticky top-0 z-10 bg-ink-50">
          <tr class="border-b border-ink-200">
            <th
              v-for="field in normalisedFields"
              :key="field.key"
              scope="col"
              class="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500"
            >
              <slot :name="`head(${field.key})`" :field="field">
                <button
                  v-if="field.sortable"
                  type="button"
                  class="flex items-center gap-1 transition hover:text-ink-800"
                  @click="toggleSort(field)"
                >
                  {{ labelFor(field) }}
                  <ChevronUpIcon
                    v-if="sortKey === field.key && sortAsc"
                    class="h-3.5 w-3.5"
                  />
                  <ChevronDownIcon
                    v-else-if="sortKey === field.key"
                    class="h-3.5 w-3.5"
                  />
                  <ChevronUpDownIcon v-else class="h-3.5 w-3.5 opacity-40" />
                </button>
                <span v-else>{{ labelFor(field) }}</span>
              </slot>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="busy">
            <td
              :colspan="normalisedFields.length"
              class="px-4 py-10 text-center text-ink-500"
            >
              <span
                class="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600"
                aria-hidden="true"
              />
              <span class="mt-2 block text-xs">Loading…</span>
            </td>
          </tr>

          <tr v-else-if="!rows.length">
            <td
              :colspan="normalisedFields.length"
              class="px-4 py-10 text-center text-ink-500"
            >
              {{ emptyText }}
            </td>
          </tr>

          <template v-else>
          <template v-for="(item, index) in rows" :key="index">
            <tr
              class="border-b border-ink-100 transition"
              :class="[
                selectable && 'cursor-pointer hover:bg-brand-50/60',
                selectedIndex === index && 'bg-brand-50',
              ]"
              @click="selectRow(item, index)"
            >
              <td
                v-for="field in normalisedFields"
                :key="field.key"
                class="px-4 py-2.5 align-top text-ink-700"
              >
                <slot
                  :name="`cell(${field.key})`"
                  :item="item"
                  :index="index"
                  :value="item[field.key]"
                  :toggle-details="() => toggleDetails(index)"
                  :details-showing="expanded.has(index)"
                >
                  {{ field.key === 'index' ? index + 1 : item[field.key] }}
                </slot>
              </td>
            </tr>

            <tr v-if="expanded.has(index)" class="border-b border-ink-100 bg-ink-50/60">
              <td :colspan="normalisedFields.length" class="px-4 py-3">
                <slot name="row-details" :item="item" :index="index" />
              </td>
            </tr>
          </template>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
