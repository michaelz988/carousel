<script setup>
import { ref } from 'vue'
import PublicHeader from '@/components/PublicHeader.vue'
import PublicFooter from '@/components/PublicFooter.vue'
import CarouselScene from '@/components/CarouselScene.vue'
import LoginDialog from '@/components/LoginDialog.vue'

const showLogin = ref(false)

// The lottery stages, in the order they happen — the numbering marks a real
// sequence rather than decorating the list.
const workflow = [
  {
    title: 'The teacher opens an assignment',
    body: 'They set the topic, write the instructions, and choose how many choices each student must rank.',
  },
  {
    title: 'Students rank their choices',
    body: 'Each student submits several people they would be glad to research, in order of preference, with a short case for why each one matters.',
  },
  {
    title: 'Entries close',
    body: 'A readiness summary shows who has submitted and who has not, so nothing is locked before the class is ready.',
  },
  {
    title: 'Everyone is assigned',
    body: 'The lottery matches preferences as closely as it can while guaranteeing no two students in the class write about the same person.',
  },
]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-ink-50">
    <PublicHeader @login="showLogin = true" />

    <main class="flex-1">
      <!-- Banner -->
      <section class="border-b border-ink-200 bg-white">
        <div
          class="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-20"
        >
          <div>
            <h1
              class="font-display text-4xl leading-[1.08] font-medium text-ink-900 sm:text-5xl"
            >
              Fair Lottery For Class Assignments
            </h1>
            <p class="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
              Students rank the topics they want. Carousel gives each of them a
              different one, as close to their first choice as the class allows.
            </p>
            <button
              type="button"
              class="mt-8 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              @click="showLogin = true"
            >
              Log in to Carousel
            </button>
          </div>

          <div class="mx-auto w-full max-w-lg">
            <CarouselScene />
          </div>
        </div>
      </section>

      <!-- What it is -->
      <section class="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6">
        <h2 class="font-display text-2xl font-semibold text-ink-900">
          What Carousel is for
        </h2>
        <p class="mt-4 leading-relaxed text-ink-600">
          Some assignments only work if every student takes a different topic —
          an AP English class researching a Person of American Significance, for
          instance, where no two essays should cover the same figure. Handing
          those out by hand is slow and hard to keep fair. Carousel collects
          everyone's ranked preferences and settles it in one run, so the
          outcome does not depend on who replied first or who asked loudest.
        </p>
      </section>

      <!-- Workflow -->
      <section class="border-t border-ink-200 bg-white">
        <div class="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20">
          <h2 class="text-center font-display text-2xl font-semibold text-ink-900">
            How the lottery works
          </h2>

          <ol class="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="(step, i) in workflow" :key="step.title" class="relative">
              <span
                class="grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-display text-base font-semibold text-white"
              >
                {{ i + 1 }}
              </span>
              <!-- connector between steps on wide screens -->
              <span
                v-if="i < workflow.length - 1"
                class="absolute top-5 left-12 hidden h-px w-[calc(100%-2rem)] bg-ink-200 lg:block"
                aria-hidden="true"
              />
              <h3 class="mt-4 font-display text-lg font-semibold text-ink-900">
                {{ step.title }}
              </h3>
              <p class="mt-2 text-sm leading-relaxed text-ink-600">
                {{ step.body }}
              </p>
            </li>
          </ol>
        </div>
      </section>
    </main>

    <PublicFooter />

    <LoginDialog v-if="showLogin" @close="showLogin = false" />
  </div>
</template>
