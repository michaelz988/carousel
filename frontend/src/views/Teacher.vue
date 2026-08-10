<template>
  <div id="dashboard" class="page">
    <div class="dash-grid">
      <aside class="profile-card">
        <div class="profile-card__avatar">{{ initials }}</div>
        <div>
          <p class="profile-card__name">{{ displayName }}</p>
          <p class="profile-card__email">{{ activeUser.email }}</p>
          <span class="role-badge role-badge--teacher">Teacher</span>
        </div>
      </aside>

      <div class="dash-content">
        <div v-if="assignments.length" class="assignment-list">
          <div v-for="assignment in assignments" :key="assignment.id" class="assignment-card">
            <h2 class="assignment-card__title">{{ assignment.title }}</h2>
            <span class="assignment-card__date">{{ assignment.createdAt | formatDate }}</span>
            <div class="assignment-card__actions">
              <b-button variant="outline-secondary" @click="editAssignment(assignment)">
                <img src="./../assets/edit.png" class="action-ic" alt="" aria-hidden="true"> Edit
              </b-button>
              <b-button variant="outline-primary" @click="manageStudents(assignment)">
                <img src="./../assets/student.png" class="action-ic" alt="" aria-hidden="true"> Students
              </b-button>
              <b-button variant="primary" @click="adminLottery(assignment)">
                <img src="./../assets/lottery.png" class="action-ic" alt="" aria-hidden="true"> Lottery
              </b-button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="mb-0">There are currently no assignments.</p>
        </div>
      </div>
    </div>

    <!-- full assignment modal -->
    <transition name="fade">
      <assignment-modal v-if="showAssignmentModal" @close="closeAssignmentModal()">
      </assignment-modal>
    </transition>

    <!-- students list modal -->
    <transition name="fade">
      <students-list v-if="showStudentsList" :activeAssignment="this.activeAssignment" @close="closeStudentsList()">
      </students-list>
    </transition>

    <!-- lottery admin modal -->
    <transition name="fade">
      <lottery-admin v-if="showLotteryAdmin" :activeAssignment="this.activeAssignment" @close="closeLotteryAdmin()">
      </lottery-admin>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import TeacherDataService from "../services/TeacherDataService"
import AssignmentModal from '../components/AssignmentModal.vue'
import StudentsList from '../components/StudentsList.vue'
import LotteryAdmin from '../components/LotteryAdmin.vue'

export default {
  components: {
    AssignmentModal,
    StudentsList,
    LotteryAdmin
  },
  data() {
    return {
      assignments: [],
      showAssignmentModal: false,
      showStudentsList: false,
      showLotteryAdmin: false,
      activeAssignment: {}
    }
  },
  computed: {
    ...mapState(['activeUser', 'posts']),
    displayName() {
      const u = this.activeUser
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ')
      return full || u.username || (u.email ? u.email.split('@')[0] : 'Teacher')
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
      TeacherDataService.getAll()
        .then(response => {
          this.assignments = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    async editAssignment(assignment) {
      this.activeAssignment = assignment
      this.$store.dispatch('updateActiveAssignment', assignment)
      this.showAssignmentModal = true
    },
    closeAssignmentModal() {
      this.showAssignmentModal = false
    },
    async manageStudents(assignment) {
      this.activeAssignment = assignment
      this.$store.dispatch('updateActiveAssignment', assignment)
      this.showStudentsList = true
    },
    closeStudentsList() {
      this.showStudentsList = false
    },
    async adminLottery(assignment) {
      this.activeAssignment = assignment
      this.$store.dispatch('updateActiveAssignment', assignment)
      this.showLotteryAdmin = true
    },
    closeLotteryAdmin() {
      this.showLotteryAdmin = false
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
