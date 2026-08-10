<template>
  <app-modal title="Students List" size="xl" @close="$emit('close')">
    <div class="row">
    <div class="col-lg-8">
      <div>
        <b-table striped hover sticky-header="600px" :items="students" :fields="fields"
          :select-mode="selectMode"
          selectable
          @row-selected="onStudentSelected" >
          <!-- A virtual column -->
          <template #cell(index)="data">
            {{ data.index + 1 }}
          </template>
          <!-- A virtual column -->
          <template #cell(firstName)="data">
            {{ data.item.Student.firstName? data.item.Student.firstName : '' }}
          </template>
          <!-- A virtual column -->
          <template #cell(lastName)="data">
            {{ data.item.Student.lastName? data.item.Student.lastName : ''}}
          </template>
          <!-- A virtual column -->
          <template #cell(username)="data">
            {{ data.item.Student.username? data.item.Student.username : ''}}
          </template>
        </b-table>
      </div>

      <b-button class="m-3 btn btn-sm btn-danger" @click="removeAllStudents">
        Remove All
      </b-button>
    </div>
    <div class="col-lg-4">
      <div v-if="currentStudent">
        <h4>Student</h4>
        <div>
          <label><strong>Name:</strong> {{ currentStudent.firstName }} {{ currentStudent.lastName }}</label>
        </div>
        <div>
          <label><strong>Gmail:</strong> {{ currentStudent.email }}</label>
        </div>
      </div>
      <div v-else>
        <br>
        <p>Please click on a Student...</p>
      </div>
    </div>
  </div>

    <br>
    <b-button class="m-3 btn btn-sm" @click="importStudents()">Import students</b-button>

  <!-- students import modal -->
    <transition name="fade">
      <students-import v-if="showStudentsImport" :activeAssignment="this.activeAssignment" @close="closeStudentsImport()">
      </students-import>
    </transition>
  </app-modal>
</template>

<script>
import { mapState } from 'vuex'
import StudentDataService from "../services/StudentDataService"
import StudentsImport from '../components/StudentsImport'
import AssignmentDataService from "../services/AssignmentDataService"
import TeacherDataService from "../services/TeacherDataService"
import LotteryModal from '../components/LotteryModal.vue'
import AppModal from "./AppModal"

export default {
  name: "students-list",
  components: {
    StudentsImport,
    AppModal
  },
  data() {
    return {
      fields: ['index', 
        { key: 'firstName', label: 'First Name' }, 
        { key: 'lastName', label: 'Last Name' }, 
        { key: 'username', label: 'User Name' },
        { key: 'period', label: 'Period', sortable: true,
          sortByFormatted: (value, key, item) => {
            return `${item.period}`
          }
        }
      ],
      selectMode: 'single',
      students: [],
      currentStudent: null,
      showStudentsImport: false
    };
  },
  computed: {
    ...mapState(['activeAssignment'])
  },
  methods: {
    retrieveStudents(assignmentId) {
      StudentDataService.getAll(assignmentId)
        .then(response => {
          this.students = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveStudents(this.activeAssignment.assignmentId);
      this.currentStudent = null;
    },

    onStudentSelected(items) {
      this.currentStudent = items[0];
    },

    removeAllStudents() {
      this.$confirm("All registered students will be removed from this assignment.", "Are you sure?", 'warning').then(() => {
        StudentDataService.deleteAll(this.activeAssignment.assignmentId)
          .then(response => {
            console.log(response.data);
            this.refreshList();
          })
          .catch(e => {
            console.log(e);
          });
      }).catch(err => {
        console.log(err);
      });
    },

    importStudents() {
      console.log("Importing student list ...");
      this.showStudentsImport = true;
    },

    closeStudentsImport() {
      this.refreshList();

      this.showStudentsImport = false;
    }
  },
  mounted() {
    this.retrieveStudents(this.activeAssignment.assignmentId);
  }
};
</script>

<style>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}


#closebutton{
  font-size: 1.5em;
  display: block;
  vertical-align: right;
  text-align: right;
}
</style>