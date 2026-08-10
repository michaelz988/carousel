# Carousel

Carousel is a web-based **lottery system for school assignments**. Teachers create
an assignment in which each student must choose a **POAS** (a notable person to
research and write a short biography about). Students submit ranked choices, and a
fair lottery assigns every student a unique POAS so there are no duplicates.

Live app: `carousel.code4real.org` · API: `api.code4real.org`

## Roles

- **Student** — view assignments, submit and edit lottery entries, browse the POAS list.
- **Teacher** — create and edit assignments, manage the student roster, lock and run the lottery.
- **Admin** — manage teachers at the school level.

## Architecture

- **Frontend:** Vue 2 SPA (vue-cli) + BootstrapVue — see [`frontend/`](frontend/).
- **Backend:** Express.js + Sequelize ORM (MySQL) — see [`backend/`](backend/).
- **Auth:** Google Sign-In + JWT, role-based (admin / teacher / student).
- **Infrastructure:** migrating to SST v3 on AWS — see [`MIGRATION_PLAN.md`](MIGRATION_PLAN.md).

## Development

```bash
# Frontend (Vue dev server)
cd frontend && npm install && npm run serve

# Backend (Express API)
cd backend && npm install && npm start
```

> Note: this repo targets Node 16. On newer Node versions the frontend build
> needs `NODE_OPTIONS=--openssl-legacy-provider` (a known vue-cli 4 / webpack 4
> compatibility flag).

## Design system

The UI is themed from a single set of design tokens in
[`frontend/src/assets/scss/_tokens.scss`](frontend/src/assets/scss/_tokens.scss),
which are applied to both the custom components and BootstrapVue (by overriding
Bootstrap's Sass variables before it is imported). See `_global.scss` and
`_layout.scss` in the same folder for shared component styles.
