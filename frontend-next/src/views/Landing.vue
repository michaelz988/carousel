<script setup>
import PublicHeader from '@/components/PublicHeader.vue'
import PublicFooter from '@/components/PublicFooter.vue'

// The three lottery stages, in the order they actually happen — the numbering
// encodes a real sequence rather than decorating the list.
const steps = [
  {
    title: 'Students rank their choices',
    body: 'Each student submits several people they would be glad to research, in order of preference, with a short case for why each one matters.',
  },
  {
    title: 'The teacher closes entries',
    body: 'A readiness summary shows who has submitted and who has not, so nothing is locked before the class is ready.',
  },
  {
    title: 'The lottery assigns everyone',
    body: 'Carousel matches preferences as closely as it can while guaranteeing no two students in the class write about the same person.',
  },
]

const audiences = [
  {
    who: 'For teachers',
    points: [
      'Create an assignment and import your roster from a class list',
      'Watch submissions arrive by class period',
      'Run the lottery once, and reopen it if something needs correcting',
    ],
  },
  {
    who: 'For students',
    points: [
      'Submit and reorder your choices until entries close',
      'See which people have already been claimed',
      'Find out which person you were assigned, and why it was that one',
    ],
  },
]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-ink-50">
    <PublicHeader />

    <main class="flex-1">
      <!-- Hero -->
      <section class="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-6 sm:pt-24 sm:pb-20">
        <p
          class="mb-5 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-wide text-brand-700 uppercase"
        >
          Person of American Significance
        </p>
        <h1
          class="max-w-3xl font-display text-4xl leading-[1.1] font-medium text-ink-900 sm:text-5xl"
        >
          Every student gets someone worth writing about.
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
          Carousel runs the assignment lottery for AP English classes. Students
          rank the figures they most want to research; Carousel gives each of
          them a different one, as close to their first choice as the class
          allows.
        </p>
        <div class="mt-9 flex flex-wrap items-center gap-3">
          <RouterLink
            to="/login"
            class="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Log in to Carousel
          </RouterLink>
          <span class="text-sm text-ink-500">
            Use the Google account from your school
          </span>
        </div>
      </section>

      <!-- How it works -->
      <section class="border-y border-ink-200 bg-white">
        <div class="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <h2 class="font-display text-2xl font-semibold text-ink-900">
            How the lottery works
          </h2>
          <ol class="mt-9 grid gap-8 sm:grid-cols-3">
            <li v-for="(step, i) in steps" :key="step.title">
              <span
                class="grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white"
              >
                {{ i + 1 }}
              </span>
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

      <!-- Audiences -->
      <section class="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
        <div class="grid gap-6 md:grid-cols-2">
          <article
            v-for="group in audiences"
            :key="group.who"
            class="card p-7"
          >
            <h3 class="font-display text-xl font-semibold text-ink-900">
              {{ group.who }}
            </h3>
            <ul class="mt-5 space-y-3">
              <li
                v-for="point in group.points"
                :key="point"
                class="flex gap-3 text-sm leading-relaxed text-ink-600"
              >
                <span
                  class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                  aria-hidden="true"
                />
                {{ point }}
              </li>
            </ul>
          </article>
        </div>
      </section>

      <!-- Fairness note -->
      <section class="border-t border-ink-200 bg-white">
        <div class="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6">
          <h2 class="font-display text-2xl font-semibold text-ink-900">
            Fair by construction
          </h2>
          <p class="mt-4 leading-relaxed text-ink-600">
            No two students in a class are assigned the same person, and nobody
            gets a better result by submitting first. The order entries arrive
            in has no bearing on the outcome — only the preferences students
            record before the teacher closes the assignment.
          </p>
        </div>
      </section>
    </main>

    <PublicFooter />
  </div>
</template>
