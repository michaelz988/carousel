<template>
  <app-modal size="md" @close="$emit('close')">
    <template #title>{{ assignment.title }}</template>

    <p class="modal-meta">{{ assignment.createdAt | formatDate }}</p>

    <div class="modal-section">
      <h3 class="modal-section__title">Description</h3>
      <textarea id="description" v-model.trim="assignment.description" required rows="5"></textarea>
    </div>

    <div class="modal-section">
      <h3 class="modal-section__title">Configurations</h3>
      <label class="modal-field">
        <span>Minimum number of lottery entries each student must submit:</span>
        <vue-numeric-input v-model="assignment.minEntries" :min="1" :max="3" :step="1"></vue-numeric-input>
      </label>
      <label class="modal-field">
        <span>Maximum number of lottery entries each student can enter:</span>
        <vue-numeric-input v-model="assignment.maxEntries" :min="3" :max="5" :step="1"></vue-numeric-input>
      </label>
    </div>

    <template #footer>
      <b-button variant="secondary" @click="$emit('close')">Cancel</b-button>
      <b-button variant="primary" @click="updateAssignment">Update</b-button>
    </template>
  </app-modal>
</template>

<script>
import VueNumericInput from 'vue-numeric-input';
import { mapState } from 'vuex'
import moment from 'moment'
import AssignmentDataService from "../services/AssignmentDataService";
import AppModal from "./AppModal";

export default {
  components: {
    VueNumericInput,
    AppModal
  },
  data() {
    return {
      assignment: {}
    }
  },
  computed: {
    ...mapState(['activeUser', 'activeAssignment'])
  },
  methods: {
    closeAssignmentModal() {
      this.$emit('close')
    },

    updateAssignment() {
      AssignmentDataService.update(this.assignment.assignmentId, this.assignment)
        .then(response => {
          console.log(response.data);
          AssignmentDataService.getOne(this.assignment.assignmentId)
            .then(response => {
              this.assignment = response.data;
              this.$store.dispatch('updateActiveAssignment', response.data);
              console.log(response.data);
            })
            .catch(e => {
              console.log(e);
            });
        })
        .catch(e => {
          console.log(e);
        });
    },
  },  
  async mounted() {
    this.assignment = this.activeAssignment
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

<style scoped>

/* Navbar container */
#assigned {
  overflow: hidden;
  background-color: #417a63;
  color: white;
  text-align: center;
  border-radius: 5px;
  
  font-family: 'Montserrat', sans-serif;  
}



#closebutton{
  font-size: 1.5em;
  display: block;
  vertical-align: right;
  text-align: right;
}

</style>