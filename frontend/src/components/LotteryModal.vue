<template>
  <app-modal size="lg" @close="closeAssignmentModal()">
    <template #title>{{ activeAssignment.title }}</template>

    <div class="lottery-head">
      <p class="modal-meta">{{ activeAssignment.createdAt | formatDate }}</p>
      <p v-if="activeAssignment.description">{{ activeAssignment.description }}</p>
      <a href="https://www.code4real.org/projects/student-instructions/" target="_blank">Instructions on how to enter POAS choices</a>
    </div>

    <b-form @submit.prevent>
      <div v-for="(entry, index) in lotteryEntries" :key="entry.id" class="lottery-entry">
        <div class="lottery-entry__head">
          <h5 class="lottery-entry__q">{{index + 1}}. Your choice of POAS (commonly known name):</h5>
          <span class="lottery-entry__head-actions">
            <label v-if="(index + 1 == poasAssigned)" id="assigned">assigned</label>
            <b-button v-if="!isLocked" size="sm" variant="outline-danger" :disabled="delDisabled" @click="delEntry(index)">Delete</b-button>
          </span>
        </div>
        <input v-bind:class="{invalidPoas: entry.name == '*** POAS NOT FOUND ***' || entry.name == '*** AMBIGUOUS ENTRY ***'}" type="text" placeholder="name" id="name" v-model.trim.lazy="entry.name" required maxlength="100" :disabled="isLocked">
        <!--<input type="text" placeholder="Middle name" id="mname" v-model.trim.lazy="entry.middleName" required maxlength="32" :disabled="isLocked">
        <input type="text" placeholder="Last name" id="lname" v-model.trim.lazy="entry.lastName" required maxlength="64" :disabled="isLocked">-->
        <label v-if="poasStats[index] && poasStats[index][0] == -1" id="counter" width:50px><b><i>taken</i></b></label>
        <label v-else id="counter" v-for="(count, preference) in poasStats[index]" :key="index + preference" width:150px> Opt. {{preference+1}}: {{count}}</label>
        <p v-if="entry.wikiLink"> Wikipedia Page: <a :href = "entry.wikiLink" target="_blank"> {{entry.wikiLink}} </a></p>
        <p v-if="entry.wikiDescription"> {{entry.wikiDescription}}... </p>
        <h5 class="lottery-entry__q">What is the title of the (auto)biography? (limit of 100 characters)</h5>
        <input type="textarea" v-model.lazy="entry.biography" required maxlength="100" :disabled="isLocked">
        <h5 class="lottery-entry__q">Your statement of significance for your choice: (limit of 250 characters)</h5>
        <b-textarea rows="1" max-rows="2" v-model.lazy="entry.statement" required maxlength="250" :disabled="isLocked">
        </b-textarea>
      </div>
    </b-form>

    <div v-if="!isLocked" class="lottery-actions">
      <b-button variant="outline-primary" :disabled="isMaxEntries" @click="addEntry">Add an entry</b-button>
      <b-button variant="primary" :disabled="submitDisabled" @click="submitEntries(activeAssignment)">Save</b-button>
    </div>
  </app-modal>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import AssignmentDataService from "../services/AssignmentDataService"
import LotteryDataService from "../services/LotteryDataService"
import AppModal from "./AppModal"

export default {
  components: {
    AppModal
  },
  props: ['student'],
  data() {
    return {
      showAssignmentModal: false,
      saving: false,
      lotteryEntries: [],
      poasStats: [],
      poasAssigned: 0,
    }
  },
  computed: {
    ...mapState(['activeUser', 'activeAssignment']),
    isMaxEntries: function() {
      return this.lotteryEntries.length >= this.activeAssignment.maxEntries
    },
    delDisabled: function() {
      return this.lotteryEntries.length <= this.activeAssignment.minEntries
    },
    submitDisabled: function() {
      if (this.saving) {
        return true;
      }
      for (let entry of this.lotteryEntries) {
        if (!entry.name) return true;
        if (entry.biography.length <= 1) return true;
        if (entry.statement.length <= 1) return true;
      }
      return false;
    },
    isLocked: function() {
      if ( (this.student != null) && (this.activeUser.id != this.student) ) {
        // should be a teacher, so do not lock it
        return false;
      }

      let state = this.activeAssignment.state;
      let poasAssigned = this.poasAssigned;
      return (state > 0 && !(state == 2 && poasAssigned == 0));
    },
  },
  methods: {
    addEntry() {
      this.lotteryEntries.push({
        name:'',
        //middleName:'',
        //lastName:'',
        wikiLink:'',
        wikiDescription:'',
        biography:'',
        statement:'',
        preference: this.lotteryEntries.length + 1
      });
    },
    delEntry(index) {
      this.lotteryEntries.splice(index, 1);
      this.poasStats.splice(index, 1);
      const len = this.lotteryEntries.length;
      for (let  i = index; i < len; i++) {
        this.lotteryEntries[i].preference = this.lotteryEntries[i].preference - 1;
      }
    },
    refresh(result) {
      this.poasAssigned = result.data.poasAssigned;
      this.lotteryEntries = result.data.lotteries;
      this.poasStats = result.data.poasStats;
      let count = this.lotteryEntries.length;
      while (count < this.activeAssignment.minEntries) {
        this.addEntry();
        count++;
      }
    },
    async submitEntries(assignment) {
      this.saving = true;
      await LotteryDataService.create(assignment.assignmentId, this.lotteryEntries, this.student);
      const result = await LotteryDataService.getAll(this.activeAssignment.assignmentId, this.student);
      this.refresh(result);
      this.saving = false;
    },
    closeAssignmentModal() {
      this.lotteryEntries = []
      this.showAssignmentModal = false

      this.$emit('close')
    }
  },
  async mounted() {
    const response = await AssignmentDataService.get(this.activeAssignment.assignmentId);
    this.$store.dispatch('updateActiveAssignment', response.data);

    let result = [];
    if (this.student) {
      result = await LotteryDataService.getAll(this.activeAssignment.assignmentId, this.student);
    } else {
      result = await LotteryDataService.getAll(this.activeAssignment.assignmentId);
    }
    this.refresh(result);
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
.lottery-head {
  margin-bottom: 1.25rem;
}

.lottery-head p {
  color: var(--c-text-medium);
}

.lottery-entry {
  background: #fbfcfc;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 1.1rem 1.25rem;
  margin-bottom: 1rem;
}

.lottery-entry__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.lottery-entry__head-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
}

.lottery-entry__q {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--c-text-strong);
  margin: 0 0 0.5rem;
}

.lottery-entry__q:not(:first-child) {
  margin-top: 1rem;
}

/* "assigned" badge shown next to the chosen entry */
#assigned {
  display: inline-block;
  padding: 2px 10px;
  background-color: var(--c-brand);
  color: #fff;
  text-align: center;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* per-option counters */
#counter {
  display: inline-block;
  margin-right: 0.6rem;
  font-size: 0.8rem;
  color: var(--c-text-medium);
}

.invalidPoas {
  color: var(--c-danger);
  border-color: var(--c-danger) !important;
}

.lottery-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
</style>
