import { reactive } from 'vue'

/**
 * Minimal toast store, replacing `vue-simple-alert` (Vue 2 only).
 * Same trigger points as before — it is only the presentation that changed
 * from a blocking modal to a dismissible toast.
 */
export const toasts = reactive([])

let nextId = 1

export function notify(message, type = 'error', timeout = 5000) {
  // Collapse duplicates so a burst of identical failures shows one toast
  // rather than stacking a wall of them.
  const existing = toasts.find((t) => t.message === message && t.type === type)
  if (existing) return existing.id

  const id = nextId++
  toasts.push({ id, message, type })
  if (timeout) {
    setTimeout(() => dismiss(id), timeout)
  }
  return id
}

export function dismiss(id) {
  const i = toasts.findIndex((t) => t.id === id)
  if (i !== -1) toasts.splice(i, 1)
}
