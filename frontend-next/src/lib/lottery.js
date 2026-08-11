/**
 * Single source of truth for the lottery lifecycle.
 *
 * Carousel is used once or twice a year, so neither teachers nor students build
 * muscle memory — the interface has to re-explain itself each term. All
 * lifecycle wording lives here so the student and teacher views cannot drift
 * apart and describe the same state differently.
 *
 * States come from `assignment.state`:
 *   0 Open · 1 Locked · 2 In progress · 3 Completed
 */

export const LOTTERY_STEPS = ['Open', 'Locked', 'Running', 'Assigned']

export const OPEN = 0
export const LOCKED = 1
export const IN_PROGRESS = 2
export const COMPLETED = 3

/** Status pill label + colour. */
export function lotteryState(state) {
  switch (state) {
    case OPEN:
      return { label: 'Open for entries', cls: 'bg-brand-50 text-brand-700' }
    case LOCKED:
      return {
        label: 'Entries locked',
        cls: 'bg-accent-gold-soft text-accent-gold',
      }
    case IN_PROGRESS:
      return {
        label: 'Lottery running',
        cls: 'bg-accent-blue-soft text-accent-blue',
      }
    case COMPLETED:
      return { label: 'POAS assigned', cls: 'bg-ink-100 text-ink-600' }
    default:
      return { label: 'Unknown', cls: 'bg-ink-100 text-ink-600' }
  }
}

/**
 * What this state means for a student, and whether they can still edit.
 *
 * Note: `canEdit` is derived from the lock state, never from a date. `dueDate`
 * is not enforced anywhere in the backend, so the lock is the only truthful
 * signal for "can I still change my choices?".
 */
export function studentGuidance(state) {
  switch (state) {
    case OPEN:
      return {
        canEdit: true,
        headline: 'Your choices are open',
        detail:
          'Add and rank your POAS choices. You can keep editing them until your teacher locks entries.',
      }
    case LOCKED:
      return {
        canEdit: false,
        headline: 'Entries are locked',
        detail:
          'Your teacher has closed entries and will run the lottery shortly. Your choices can no longer be changed.',
      }
    case IN_PROGRESS:
      return {
        canEdit: false,
        headline: 'The lottery is running',
        detail:
          'Your teacher is assigning a POAS to each student. Check back shortly for your result.',
      }
    case COMPLETED:
      return {
        canEdit: false,
        headline: 'Your POAS has been assigned',
        detail:
          'Every student received a different Person of American Significance.',
      }
    default:
      return { canEdit: false, headline: '', detail: '' }
  }
}

/** What this state means for a teacher, and what the next action will do. */
export function teacherGuidance(state) {
  switch (state) {
    case OPEN:
      return {
        headline: 'Students are submitting choices',
        detail:
          'Locking entries stops students editing so the lottery can run. Check the summary below first.',
      }
    case LOCKED:
      return {
        headline: 'Entries are locked',
        detail:
          'Running the lottery assigns each student one POAS, matching preferences as closely as possible.',
      }
    case IN_PROGRESS:
      return {
        headline: 'The lottery is part-way through',
        detail:
          'Resume to finish assigning the remaining students, or reopen to start over.',
      }
    case COMPLETED:
      return {
        headline: 'All students have a POAS',
        detail:
          'Students can now see their assignment. Reopening will clear every assignment.',
      }
    default:
      return { headline: '', detail: '' }
  }
}

/**
 * Whether one lottery entry is complete.
 * Mirrors the conditions that gate saving in LotteryModal, so the card and the
 * form always agree on what "done" means.
 */
export function isEntryComplete(entry) {
  if (!entry) return false
  return Boolean(
    entry.name &&
      entry.biography &&
      entry.biography.length > 1 &&
      entry.statement &&
      entry.statement.length > 1,
  )
}

/** Entries the server could not resolve to a Wikipedia page. */
export const UNRESOLVED_NAMES = [
  '*** POAS NOT FOUND ***',
  '*** AMBIGUOUS ENTRY ***',
]

export function isEntryUnresolved(entry) {
  if (!entry) return false

  // Students read their own entries through /lotteries, where the server has
  // already replaced an unmatched name with one of the markers above.
  if (UNRESOLVED_NAMES.includes(entry.name)) return true

  // Teachers read the same entries through /teacher/lottery, which keeps the
  // raw text the student typed — so the marker never appears there. The
  // reliable cross-role signal is that a resolved entry always carries a
  // Wikipedia link and an unresolved one does not.
  const name = (entry.name || '').trim()
  const link = (entry.wikiLink || '').trim()
  return Boolean(name) && !link
}

/**
 * Submission progress for one student.
 * `complete` means enough valid entries to satisfy the assignment minimum.
 */
export function submissionProgress(lotteries = [], minEntries = 0) {
  const total = lotteries.length
  const completed = lotteries.filter(isEntryComplete).length
  const unresolved = lotteries.filter(isEntryUnresolved).length
  const required = minEntries || 0

  return {
    total,
    completed,
    unresolved,
    required,
    started: total > 0,
    complete: required > 0 ? completed >= required : completed > 0,
  }
}
