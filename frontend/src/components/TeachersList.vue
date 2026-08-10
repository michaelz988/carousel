<template>
  <app-modal title="Teachers List" size="xl" @close="$emit('close')">
    <div class="row">
    <div class="col-lg-8">
      <b-row class="align-items-center mb-2">
      <b-col>
      <b-form @submit.prevent>
        <input type="text" placeholder="teacher's email" id="email" v-model.trim.lazy="email" required maxlength="64">
      </b-form>
      </b-col>
      <b-col cols="auto">
        <b-button variant="primary" @click="addTeacher()">Add</b-button>
      </b-col>
      </b-row>
      
      <div>
        <b-table striped hover sticky-header="600px" :items="teachers" :fields="fields"
          :select-mode="selectMode"
          selectable
          @row-selected="onTeacherSelected" >
          <!-- A virtual column -->
          <template #cell(index)="data">
            {{ data.index + 1 }}
          </template>
        </b-table>
      </div>

      <b-button class="m-3 btn btn-sm btn-danger" @click="removeAllTeachers">
        Remove All
      </b-button>
    </div>
    <div class="col-lg-4">
      <div v-if="currentTeacher">
        <h4>Teacher</h4>
        <div>
          <label><strong>Name:</strong> {{ currentTeacher.firstName }} {{ currentTeacher.lastName }}</label>
        </div>
        <div>
          <label><strong>Gmail:</strong> {{ currentTeacher.email }}</label>
        </div>
      </div>
      <div v-else>
        <br>
        <p>Please click on a Teacher...</p>
      </div>
    </div>
  </div>
  </app-modal>
</template>

<script>
import { mapState } from 'vuex'
import TeacherDataService from "../services/TeacherDataService"
import AppModal from "./AppModal"

export default {
  name: "teachers-list",
  components: {
    AppModal
  },
  data() {
    return {
      fields: ['index', 'firstName', 'lastName', 'username'],
      selectMode: 'single',
      email: "",
      teachers: [],
      currentTeacher: null
    };
  },
  computed: {
    ...mapState(['activeSchool'])
  },
  methods: {
    retrieveTeachers(schoolId) {
      TeacherDataService.getAllTeachers(schoolId)
        .then(response => {
          this.teachers = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveTeachers(this.activeAssignment.assignmentId);
      this.currentTeacher = null;
    },

    onTeacherSelected(items) {
      this.currentTeacher = items[0];
    },

    removeAllTeachers() {
      this.$confirm("All registered teachers will be removed from this school.", "Are you sure?", 'warning').then(() => {
        TeacherDataService.deleteAllTeachers(1)
          .then(response => {
            console.log(response.data);
            this.teachers = [];
          })
          .catch(e => {
            console.log(e);
          });
      }).catch(err => {
        console.log(err);
      });
    },

    addTeacher() {
      let data = {
        email: this.email
      };

      // ToDo: hard coded to AHS
      TeacherDataService.addTeacher(1, data)
        .then(response => {
          let teacher = response.data;
          if (teacher) {
            this.teachers.push(teacher);
          }
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  mounted() {
    // ToDo: currently hard coded to American High
    this.retrieveTeachers(1);
  }
};
</script>

<style>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>