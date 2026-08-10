<script setup>
import { ref } from 'vue'
import { AcademicCapIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import ProfileCard from '@/components/ProfileCard.vue'
import AppButton from '@/components/AppButton.vue'
import TeachersList from '@/components/TeachersList.vue'

const auth = useAuthStore()
const showTeachers = ref(false)
</script>

<template>
  <div class="page">
    <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
      <ProfileCard :user="auth.activeUser" :role="auth.role" />

      <div>
        <h1 class="mb-5 font-display text-2xl font-semibold">Administration</h1>

        <article class="card p-5 sm:p-6">
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
      </div>
    </div>

    <TeachersList v-if="showTeachers" @close="showTeachers = false" />
  </div>
</template>
