<script setup>
import { ref } from 'vue'
import { AcademicCapIcon } from '@heroicons/vue/24/outline'
import AppButton from '@/components/AppButton.vue'
import TeachersList from '@/components/TeachersList.vue'

const showTeachers = ref(false)
</script>

<template>
  <div class="page">
    <h1 class="mb-5 font-display text-2xl font-semibold">Administration</h1>

    <article class="card max-w-2xl p-5 sm:p-6">
      <h2 class="font-display text-lg font-semibold text-ink-900">
        American High School
      </h2>
      <p class="mt-0.5 text-sm text-ink-500">
        Manage the teachers who can run assignments at this school.
      </p>
      <div class="mt-5 border-t border-ink-100 pt-4">
        <AppButton variant="primary" @click="showTeachers = true">
          <AcademicCapIcon class="h-4 w-4" aria-hidden="true" />
          Manage teachers
        </AppButton>
      </div>
    </article>

    <TeachersList v-if="showTeachers" @close="showTeachers = false" />
  </div>
</template>
