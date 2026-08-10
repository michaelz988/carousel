# Carousel — Frontend (Vue 3)

The modernised client for Carousel, replacing the Vue 2 app in [`../frontend`](../frontend).
Built while the old app remains intact so the two can be compared side by side.

## Stack

| Concern    | Old (`frontend/`)      | New (this app)               |
| ---------- | ---------------------- | ---------------------------- |
| Framework  | Vue 2.6 (EOL Dec 2023) | Vue 3.5                      |
| Build      | vue-cli 4 / webpack 4  | Vite 8                       |
| UI         | BootstrapVue (Vue 2)   | Tailwind v4 + Headless UI    |
| State      | Vuex 3                 | Pinia                        |
| Routing    | vue-router 3           | vue-router 5                 |
| Dates      | moment                 | native `Intl`                |
| Alerts     | vue-simple-alert       | in-app toasts (`lib/notify`) |

Bundle: **~70 kB gzipped** total, versus ~460 kB for the old vendor chunk alone.
Production build takes ~1.3s (previously ~40s).

## Running

```bash
npm install
npm run dev
```

Then open http://localhost:8081.

> **The port matters.** `8081` is the origin authorised for the Google OAuth
> client, so Sign-In only renders there. Run either `frontend/` or
> `frontend-next/` at a time, not both.

API calls go to `/api`, proxied by Vite to `http://localhost:8080` (see
`vite.config.js`). Because the proxy makes requests same-origin, the backend's
hardcoded CORS origin needs no change. Start the backend with:

```bash
cd ../backend && node server.js
```

## Structure

- `src/views/` — routed pages (Login, Dashboard, Student, Teacher, Admin, Settings).
- `src/components/` — `SiteNav`, `AppModal` (Headless UI Dialog), `DataTable`
  (the `b-table` replacement), assignment/lottery/roster modals.
- `src/stores/auth.js` — Pinia store; `persist.js` is a small localStorage
  plugin replacing `vuex-persistedstate`.
- `src/services/` — Axios data services, ported unchanged apart from imports.
- `src/lib/` — `user.js` (name/initials/role/status helpers), `date.js`,
  `notify.js`.
- `src/style.css` — the design system. Tailwind v4 is CSS-first, so the palette,
  fonts and elevation live in `@theme` and generate real utilities
  (`bg-brand-600`, `text-ink-500`, …).

## Deliberate changes from the Vue 2 app

These are behaviour changes, made knowingly:

1. **Firebase removed.** The app authenticates through Google Identity Services
   against the backend. Firebase auth never actually signed a user in, so
   `onAuthStateChanged` always fired with `null` and the Firestore profile
   paths (`fetchUserProfile`, `updateProfile`, email/password login, signup)
   could not run. They were dropped rather than carried over as dead code.
2. **Settings is read-only.** It previously posted to Firestore via
   `fb.auth.currentUser`, which is always `null` — the form could never save.
   It now shows the account details that actually exist.
3. **No redirect on request failure.** The old response interceptor pushed `/`
   on any non-401 error; combined with the role-based landing redirect this
   caused an infinite error/redirect loop. Auth failures (401 **and** 403 — the
   API returns 403 for a missing/invalid token) now go to `/login`; other
   errors show a toast and leave the user where they are.
4. **Auth header is merged, not replaced.** The old request interceptor
   overwrote `config.headers` wholesale, clobbering the `multipart/form-data`
   content type on roster uploads.
5. **`AssignmentDataService.getOne()`** was called but never defined on that
   service (it only has `get()`), so the post-save refresh always threw. Now
   uses `get()`.

## Not yet migrated

- Creating a new assignment (the old app had no UI for it either — the sample
  assignment comes from the backend seed).
- `vue-numeric-input` and `vue-step-progress` were Vue 2 only; both are
  replaced with native inputs and a hand-built step indicator.
