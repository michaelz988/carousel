import { defineStore } from 'pinia'
import AssignmentDataService from '@/services/AssignmentDataService'
import TeacherDataService from '@/services/TeacherDataService'
import { useAuthStore } from '@/stores/auth'

/**
 * The user's assignments, loaded once and shared by the sidebar, the home
 * overview and the assignment screen — so selecting one in the sidebar does
 * not trigger a second fetch.
 *
 * Teachers and students read from different endpoints but get the same shape.
 */
export const useAssignmentsStore = defineStore('assignments', {
  state: () => ({
    items: [],
    loading: false,
    loaded: false,
  }),

  getters: {
    byId: (s) => (id) =>
      s.items.find((a) => String(a.assignmentId) === String(id)) || null,
    isEmpty: (s) => s.loaded && s.items.length === 0,
  },

  actions: {
    async load({ force = false } = {}) {
      if (this.loading) return
      if (this.loaded && !force) return

      const auth = useAuthStore()
      this.loading = true
      try {
        const service =
          auth.role === 'ROLE_TEACHER' ? TeacherDataService : AssignmentDataService
        const response = await service.getAll()
        this.items = Array.isArray(response.data) ? response.data : []
        this.loaded = true
      } catch (e) {
        console.log(e)
      } finally {
        this.loading = false
      }
    },

    /** Teacher-only. The API links the creator, so it appears on reload. */
    async create({ title, description, minEntries, maxEntries }) {
      const response = await AssignmentDataService.create({
        title,
        description,
        minEntries,
        maxEntries,
      })
      await this.load({ force: true })
      return response.data
    },

    /** Keep the cached copy in step after an edit or a lottery transition. */
    upsert(assignment) {
      if (!assignment?.assignmentId) return
      const i = this.items.findIndex(
        (a) => String(a.assignmentId) === String(assignment.assignmentId),
      )
      if (i === -1) this.items.push(assignment)
      else this.items.splice(i, 1, { ...this.items[i], ...assignment })
    },

    reset() {
      this.items = []
      this.loaded = false
      this.loading = false
    },
  },
})
