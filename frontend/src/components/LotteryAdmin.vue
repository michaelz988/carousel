<template>
  <app-modal title="Lottery Administration" size="xl" @close="$emit('close')">
    <div>
      <step-progress :steps="lotterySteps" :current-step="activeAssignment.state" icon-class="fa fa-check"
        active-color="green" passive-color="grey"
        :active-thickness="4" :passive-thickness="3" :line-thickness="5">
      </step-progress>
    </div>
      <br>
      <form @submit.prevent>
        <b-row>
          <b-col lg="8">
        <div v-if="activeAssignment.state == 0">
          <button @click="lockLottery(activeAssignment)" class="button">Lock lottery entries</button>
        </div>
        <div v-else-if="activeAssignment.state == 1">
          <button @click="runLottery(activeAssignment)" class="button">Run lottery</button> &nbsp;&nbsp;
          <button @click="unlockLottery(activeAssignment)" class="button">Reopen lottery</button>
        </div>
        <div v-else-if="activeAssignment.state == 2">
          <button @click="resumeLottery(activeAssignment)" class="button">Resume lottery</button> &nbsp;&nbsp;
          <button @click="unlockLottery(activeAssignment)" class="button">Reopen lottery</button>
        </div>
        <div v-else-if="activeAssignment.state == 3">
          <button @click="unlockLottery(activeAssignment)" class="button">Reopen lottery</button>
        </div>
        <div v-else>
        </div>
        </b-col>
        <b-col lg="4">
        <button @click="refreshList(activeAssignment)" class="button">Refresh</button>
        </b-col>
        </b-row>
      </form>
      <br>

      <div b-col col lg="4">
        <b-row>
          <b-col md="2">
          <h5>Lottery result</h5>
          </b-col>
          <b-col md="2">
          <b-button variant="outline-primary" size="sm" v-on:click="copyToClipboard('select_txt')">Click To Copy</b-button>
          </b-col>
          <b-col md="4">
          <b-input-group size="sm">
            <b-form-input
              id="filter-input"
              v-model="filter"
              type="search"
              placeholder="Type to filter by teacher's last name"
            ></b-form-input>

            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
          </b-col>
        </b-row>
        <b-table striped hover sticky-header="600px" :items="students" :fields="fields"
          :busy.sync="isBusy"
          sort-icon-left
          :select-mode="selectMode"
          selectable
          @row-selected="onStudentSelected"
          :filter="filter"
          :filter-included-fields="filterOn"
          id="select_txt">
          <template v-slot:head(show_details)="data">
            <b-button @click="toggleDetails()" size="sm">{{ detailShowing? 'Hide All Details' : 'Show All Details' }} </b-button>
          </template>
          <!-- A virtual column -->
          <template #cell(index)="data">
            {{ data.index + 1 }}
          </template>
          <!-- Another virtual composite column -->
          <template #cell(teacher)="data">
            {{ data.item.ClassTeacher.Teacher? data.item.ClassTeacher.Teacher.lastName : ''}}
          </template>
          <!-- A virtual composite column -->
          <template #cell(student)="data">
            {{ data.item.Student.lastName? data.item.Student.firstName + ' ' + data.item.Student.lastName :
              data.item.Student.username }}
          </template>
          <!-- Another virtual composite column -->
          <template #cell(poas)="data">
            {{ data.item.poa? data.item.poa.name :
              data.item.lotteries.length + ' entries' }}
          </template>
          <!-- Another virtual composite column -->
          <template #cell(show_details)="row">
            <b-button size="sm" @click="row.toggleDetails" class="mr-2">
              {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
            </b-button>
          </template>

          <template #row-details="row">
            <b-card>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Biography:</b></b-col>
                <b-col>{{ row.item.preferenceChosen? row.item.lotteries[row.item.preferenceChosen - 1].biography : '' }}</b-col>
              </b-row>

              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Significance:</b></b-col>
                <b-col>{{ row.item.preferenceChosen? row.item.lotteries[row.item.preferenceChosen - 1].statement : ''  }}</b-col>
              </b-row>
            </b-card>
          </template>
        </b-table>
      </div>

    <div b-col col lg="4">
      <div v-if="currentStudent">
        <transition name="fade">
          <lottery-modal :student="currentStudent.studentId" @close="closeStudentLotteryModal()">
          </lottery-modal>
        </transition>
      </div>
      <div v-else>
        <br />
        <p>Please click on a Student...</p>
      </div>
    </div>
  </app-modal>
</template>

<script>
import { mapState } from 'vuex'
import AssignmentDataService from "../services/AssignmentDataService"
import TeacherDataService from "../services/TeacherDataService"
import LotteryModal from '../components/LotteryModal.vue'
import AppModal from "./AppModal"

import StepProgress from 'vue-step-progress';
// import the css (OPTIONAL - you can provide your own design)
import 'vue-step-progress/dist/main.css';

export default {
  name: "lottery-admin",
  components: {
    'lottery-modal': LotteryModal,
    'step-progress': StepProgress,
    AppModal
  },
  data() {
    return {
      fields: [
        'index',
        { key: 'student', label: 'Student Name', sortable: true,
          sortByFormatted: (value, key, item) => {
            return `${item.Student.lastName}`
          }
        },
        { key: 'teacher', label: 'Teacher', sortable: true,
           filterByFormatted: (value, key, item) => {
            return `${item.ClassTeacher.Teacher.lastName}`
          },
          sortByFormatted: (value, key, item) => {
            return `${item.ClassTeacher.Teacher.lastName}`
          }
        },
        { key: 'period', label: 'Period', sortable: true,
          sortByFormatted: (value, key, item) => {
            return `${item.period}`
          }
        },
        { key: 'poas', label: 'POAS Assigned', sortable: true,
          sortByFormatted: (value, key, item) => {
            return item.poa?`${item.poa.name}`:``
          }
        }, 'show_details'
      ],
      selectMode: 'single',
      isBusy: false,
      students: [],
      currentStudent: null,
      detailShowing: false,
      filter: null,
      filterOn: ['teacher'],
      lotterySteps: ['Open', 'Locked', "In progress", "Completed"]
    };
  },
  computed: {
    ...mapState(['activeAssignment'])
  },
  methods: {
    async lockLottery(assignment) {
      const response = await TeacherDataService.lockLottery(assignment.assignmentId);
      let updatedAssignment = response.data;
      this.$store.dispatch('updateActiveAssignment', updatedAssignment);
    },

    async unlockLottery(assignment) {
      this.$confirm("All assigned POAS will be lost.", "Are you sure?", 'warning').then(async() => {
        this.isBusy = true;
        const response = await TeacherDataService.unlockLottery(assignment.assignmentId);
        let updatedAssignment = response.data;
        this.$store.dispatch('updateActiveAssignment', updatedAssignment);
        this.refreshList();
        this.isBusy = false;
      }).catch(err => {
        console.log(err);
      });
    },

    async runLottery(assignment) {
      this.isBusy = true;
      const response = await TeacherDataService.runLottery(assignment.assignmentId);
      let updatedAssignment = response.data;
      this.$store.dispatch('updateActiveAssignment', updatedAssignment);
      this.isBusy = false;
      this.refreshList();
    },

    async resumeLottery(assignment) {
      this.isBusy = true;
      const response = await TeacherDataService.resumeLottery(assignment.assignmentId);
      let updatedAssignment = response.data;
      this.$store.dispatch('updateActiveAssignment', updatedAssignment);
      this.isBusy = false;
      this.refreshList();
    },

    retrieveLotteryResult(assignmentId) {
      TeacherDataService.showLottery(assignmentId)
        .then(response => {
          this.students = response.data;
          this.detailShowing = false;
          console.log(this.students);
        })
        .catch(e => {
          console.log(e);
        });
    },

    refreshList() {
      this.isBusy = true;
      this.retrieveLotteryResult(this.activeAssignment.assignmentId);
      this.isBusy = false;
      this.currentStudent = null;
    },

    onStudentSelected(items) {
      this.currentStudent = items[0];
    },

    closeStudentLotteryModal() {
      this.currentStudent = null;
    },

    toggleDetails() {
      if (this.detailShowing) {
        this.collapseAll();
        this.detailShowing = false;
      } else {
        this.expandAll();
        this.detailShowing = true;
      }
    },

    expandAll() {
      for(const item of this.students) {
        this.$set(item, '_showDetails', true)
      }
    },

    collapseAll() {
      for(const item of this.students) {
        this.$set(item, '_showDetails', false)
      }
    },

    copyToClipboard(containerid){
      var range = document.createRange();
      let containerNode = document.getElementById(containerid); //// this part
      range.selectNode(containerNode); //// this part
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
      alert("data copied");
    }
  },
  async mounted() {
    const response = await AssignmentDataService.get(this.activeAssignment.assignmentId);
    this.$store.dispatch('updateActiveAssignment', response.data);

    this.retrieveLotteryResult(this.activeAssignment.assignmentId);
  }
};
</script>

<style scoped>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>