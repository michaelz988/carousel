<template>
  <div id="dashboard" class="page">
    <div class="dash-grid">
      <aside class="profile-card">
        <div class="profile-card__avatar">{{ initials }}</div>
        <div>
          <p class="profile-card__name">{{ displayName }}</p>
          <p class="profile-card__email">{{ activeUser.email }}</p>
          <span class="role-badge role-badge--admin">Admin</span>
        </div>
      </aside>

      <div class="dash-content">
        <div class="assignment-card">
          <h2 class="assignment-card__title">American High School</h2>
          <span class="assignment-card__date">School administration</span>
          <div class="assignment-card__actions">
            <b-button variant="primary" @click="manageTeachers()">
              <img src="./../assets/student.png" class="action-ic" alt="" aria-hidden="true"> Manage Teachers
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <!-- teachers list modal -->
    <transition name="fade">
      <teachers-list v-if="showTeachersList" @close="closeTeachersList()">
      </teachers-list>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import TeacherDataService from "../services/TeacherDataService"
import AssignmentModal from '../components/AssignmentModal.vue'
import TeachersList from '../components/TeachersList.vue'
import LotteryAdmin from '../components/LotteryAdmin.vue'

export default {
  components: {
    TeachersList,
  },
  data() {
    return {
      schools: [],
      showTeachersList: false,
      activeSchool: {}
    }
  },
  computed: {
    ...mapState(['activeUser', 'posts']),
    displayName() {
      const u = this.activeUser
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ')
      return full || u.username || (u.email ? u.email.split('@')[0] : 'Admin')
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
    async manageTeachers(assignment) {
      // ToDo: change to school
      //this.activeAssignment = assignment
      //this.$store.dispatch('updateActiveAssignment', assignment)
      this.showTeachersList = true
    },
    closeTeachersList() {
      this.showTeachersList = false
    }
  },
  mounted() {
    // ToDo: load schools
    //this.getAssignments();
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