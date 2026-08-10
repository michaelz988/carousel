<template>
  <app-modal title="Import a student roster" size="md" @close="$emit('close')">
    <upload-file :activeAssignment="activeAssignment"></upload-file>
  </app-modal>
</template>

<script>
import { mapState } from 'vuex'
import UploadFile from "../components/UploadFile"
import AppModal from "./AppModal"

export default {
  name: "students-import",
  components: {
    UploadFile,
    AppModal
  },
  data() {
    return {
      students: []
    };
  },
  computed: {
    ...mapState(['activeAssignment'])
  },
  methods: {

  }
};
</script>