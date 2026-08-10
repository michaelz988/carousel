/**
 * Date helpers. Replaces `moment` (deprecated, ~70 kB) with the built-in
 * Intl APIs — `fromNow()` becomes formatRelative() with identical intent.
 */
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const UNITS = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['week', 1000 * 60 * 60 * 24 * 7],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
]

export function formatRelative(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)

  for (const [unit, ms] of UNITS) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit)
  }
  return 'just now'
}

export function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
