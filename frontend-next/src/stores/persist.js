/**
 * Tiny Pinia persistence plugin — the equivalent of `vuex-persistedstate` in
 * the previous app, keeping the signed-in session across reloads.
 * Written inline rather than pulling in another dependency.
 */
const STORAGE_PREFIX = 'carousel:'

export function persistPlugin({ store }) {
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
