/**
 * User presentation helpers.
 *
 * In the Vue 2 app these were copy-pasted as computed properties into SiteNav,
 * Student, Teacher and Admin. Centralised here so all four stay consistent.
 */

export function displayName(user = {}, fallback = 'Account') {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return (
    full ||
    user.fullName ||
    user.username ||
    (user.email ? user.email.split('@')[0] : fallback)
  )
}

/**
 * Google account photo, captured from the sign-in credential.
 * Null whenever it is unavailable — signing in through the local dev token,
 * or an account with no photo — so callers fall back to initials.
 */
export function avatarUrl(user = {}) {
  return user.picture || null
}

export function initials(user = {}) {
  if (user.firstName || user.lastName) {
    return `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
  }
  const base = user.username || user.email || '?'
  return base.slice(0, 2).toUpperCase()
}

export function roleLabel(role) {
  switch (role) {
    case 'ROLE_TEACHER':
      return 'Teacher'
    case 'ROLE_ADMIN':
      return 'Admin'
    case 'ROLE_STUDENT':
      return 'Student'
    default:
      return 'Member'
  }
}

export function roleBadgeClass(role) {
  switch (role) {
    case 'ROLE_TEACHER':
      return 'bg-accent-blue-soft text-accent-blue'
    case 'ROLE_ADMIN':
      return 'bg-accent-gold-soft text-accent-gold'
    default:
      return 'bg-brand-50 text-brand-700'
  }
}

// Lottery lifecycle helpers live in `lib/lottery.js` — they are domain logic
// shared by both roles, not user presentation.
