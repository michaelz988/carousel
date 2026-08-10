<script setup>
import AppModal from '@/components/AppModal.vue'
import UploadFile from '@/components/UploadFile.vue'

const emit = defineEmits(['close'])
</script>

<template>
  <AppModal title="Import a student roster" size="sm" @close="emit('close')">
    <UploadFile />
  </AppModal>
</template>
