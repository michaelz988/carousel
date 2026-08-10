<template>
  <div id="dashboard" class="page">
    <div class="dash-grid">
      <aside class="profile-card">
        <div class="profile-card__avatar">{{ initials }}</div>
        <div>
          <p class="profile-card__name">{{ displayName }}</p>
          <p class="profile-card__email">{{ activeUser.email }}</p>
          <span class="role-badge role-badge--student">Student</span>
        </div>
      </aside>

      <div class="dash-content">
        <div v-if="assignments.length" class="assignment-list">
          <div v-for="assignment in assignments" :key="assignment.assignmentId" class="assignment-card">
            <h2 class="assignment-card__title">{{ assignment.title }}</h2>
            <span class="assignment-card__date">{{ assignment.createdAt | formatDate }}</span>
            <div class="assignment-card__actions">
              <b-button variant="primary" @click="editLottery(assignment)">
                <img src="./../assets/lottery.png" class="action-ic" alt="" aria-hidden="true"> Lottery
              </b-button>
              <b-button variant="outline-primary" @click="listPoas(assignment)">
                <img src="./../assets/POAS.png" class="action-ic" alt="" aria-hidden="true"> POAS
              </b-button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p class="mb-0">There is no assignment yet.</p>
        </div>
      </div>
    </div>

    <!-- full assignment modal -->
    <transition name="fade">
      <lottery-modal v-if="showAssignmentModal" :activeAssignment="this.activeAssignment" @close="closeAssignmentModal()">
      </lottery-modal>
    </transition>

    <transition name="fade">
      <poas-modal v-if="showPoasModal" @close="closePoasModal()">
      </poas-modal>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import AssignmentDataService from "../services/AssignmentDataService"
import LotteryModal from '../components/LotteryModal.vue'
import PoasModal from '../components/PoasList.vue'

export default {
  components: {
    LotteryModal,
    PoasModal
  },
  data() {
    return {
      assignments: [],
      showAssignmentModal: false,
      showPoasModal: false,
      activeAssignment: {},
    }
  },
  computed: {
    ...mapState(['activeUser', 'posts']),
    displayName() {
      const u = this.activeUser
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ')
      return full || u.username || (u.email ? u.email.split('@')[0] : 'Student')
    },
    initials() {
      const u = this.activeUser
      if (u.firstName || u.lastName) {
        return `${(u.firstName || '')[0] || ''}${(u.lastName || '')[0] || ''}`.toUpperCase()
      }
      const base = u.username || u.email || '?'
      return base.slice(0, 2).toUpperCase()
    }
  },
  methods: {
    getAssignments() {
      AssignmentDataService.getAll()
        .then(response => {
          this.assignments = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    async editLottery(assignment) {
      this.activeAssignment = assignment
      this.$store.dispatch('updateActiveAssignment', assignment)
      this.showAssignmentModal = true
    },
    async listPoas(assignment) {
      this.activeAssignment = assignment
      this.$store.dispatch('updateActiveAssignment', assignment)
      this.showPoasModal = true
    },
    closeAssignmentModal() {
      this.showAssignmentModal = false
    },
    closePoasModal() {
      this.showPoasModal = false
    }
  },
  mounted() {
    this.getAssignments();
  },
  filters: {
    formatDate(val) {
      if (!val) { return '-' }

      //let date = val.toDate()
      let date = new Date(val)
      return moment(date).fromNow()
    },
    trimLength(val) {
      if (val.length < 200) { return val }
      return `${val.substring(0, 200)}...`
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
