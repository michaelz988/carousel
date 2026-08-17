/**
 * Tiny Pinia persistence plugin — the equivalent of `vuex-persistedstate` in
 * the previous app, keeping the signed-in session across reloads.
 * Written inline rather than pulling in another dependency.
 */
const STORAGE_PREFIX = 'carousel:'

export function persistPlugin({ store, options }) {
  // Opt-in only. Persisting every store would cache one user's assignment list
  // into the next session on the same browser — wrong, and a small privacy
  // leak on a shared machine. Only the session itself should survive a reload.
  if (!options.persist) return

  const key = STORAGE_PREFIX + store.$id

  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      store.$patch(JSON.parse(saved))
    } catch {
      localStorage.removeItem(key)
    }
  }

  store.$subscribe((_mutation, state) => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* storage full or unavailable — session simply won't persist */
    }
  })
}
