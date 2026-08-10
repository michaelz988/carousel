# Carousel — Frontend

Vue 2 single-page app (vue-cli) with BootstrapVue, Vuex, and Vue Router. It is the
client for the Carousel assignment-lottery system. See the [root README](../README.md)
for the full product overview.

## Project setup

```bash
npm install
```

### Compiles and hot-reloads for development

```bash
npm run serve
```

### Compiles and minifies for production

```bash
npm run build
```

### Lints and fixes files

```bash
npm run lint
```

> On Node 17+ the build/serve commands need `NODE_OPTIONS=--openssl-legacy-provider`
> (vue-cli 4 / webpack 4 use the legacy OpenSSL hashing). This repo pins Node 16 via
> `.node-version`.

## Structure

- `src/views/` — routed pages (Login, Dashboard, Student, Teacher, Admin, Settings).
- `src/components/` — shared UI: `SiteNav`, `AppModal` (the accessible modal wrapper),
  and the assignment / lottery / roster modals.
- `src/assets/scss/` — the design system: `_tokens.scss` (single source of truth for
  colors, spacing, radii — also overrides Bootstrap's Sass variables), `_global.scss`,
  and `_layout.scss`.
- `src/services/` — Axios data services for the backend API.
- `src/store/` — Vuex store (auth/session, active assignment).

## Theming

All colors, radii, shadows, and the type family live in `src/assets/scss/_tokens.scss`.
Because those tokens override Bootstrap's own Sass `!default` variables *before*
Bootstrap is imported in `app.scss`, every BootstrapVue component (`b-button`,
`b-table`, `b-modal`, …) inherits the brand automatically. Component-scoped styles read
the same palette through CSS custom properties (`var(--c-brand)`, …) exposed in
`_global.scss`.
