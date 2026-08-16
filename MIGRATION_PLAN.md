# Carousel Lottery App — Serverless Migration Plan (SST + AWS)

## Current Architecture

- **Frontend:** Vue 2 SPA (vue-cli), served at `carousel.code4real.org`
- **Backend:** Express.js + Sequelize ORM + MySQL, API at `api.code4real.org`
- **Auth:** JWT tokens (x-access-token header), Google Sign-In, role-based (admin/teacher/student)
- **File uploads:** multer → local disk
- **DB:** MySQL with `sync({ force: true })` (dev mode — drops & recreates on restart)

## Target Architecture

```
carousel.code4real.org → CloudFront → S3 (Vue SPA)
api.code4real.org      → API Gateway (HTTP API) → Lambda (serverless-express) → PlanetScale MySQL
                                                 → S3 (file uploads)
```

## Decisions

- **Database:** PlanetScale (serverless MySQL, no VPC/NAT Gateway costs, Sequelize compatible via mysql2)
- **Lambda strategy:** Option A — wrap existing Express app with `@vendia/serverless-express` for fast initial deployment; split into individual handlers later
- **Domains:** `carousel.code4real.org` (frontend), `api.code4real.org` (backend API)
- **IaC:** SST v3

## Implementation Phases

### Phase 1: Project Scaffolding & SST Setup
1. Create SST v3 project at `~/src/carousel/` (monorepo root)
2. Restructure repo:
   ```
   ~/src/carousel/
   ├── sst.config.ts
   ├── sst-env.d.ts
   ├── package.json           (workspace root)
   ├── packages/
   │   ├── frontend/          (existing Vue app)
   │   ├── functions/         (Lambda handler — serverless-express wrapper)
   │   └── core/              (shared DB models, config, middleware)
   ```

### Phase 2: Backend → Lambda (serverless-express wrapper)
3. Extract shared core into `packages/core/` (models, auth middleware, utils)
4. Create Lambda handler wrapping Express app via `@vendia/serverless-express`
5. DB config reads from environment variables (SST secrets)
6. Remove `sync({ force: true })` — replace with migration/seed scripts
7. Remove hardcoded credentials from `db.config.js` and `auth.config.js`
8. Remove the numeric token bypass in `authJwt.js` (security hole)

### Phase 3: File Uploads → S3
9. Replace multer local storage with S3 (pre-signed URLs or direct stream)
10. SST `Bucket` construct for uploads

### Phase 4: Database Setup
11. Set up PlanetScale database
12. Write Sequelize migration scripts (replace `sync({ force: true })`)
13. Write seed script for roles + initial accounts
14. Set `pool.max: 1` per Lambda instance
15. Connection teardown handling for Lambda lifecycle

### Phase 5: Frontend Updates
16. Replace hardcoded `localhost:8080/api` with env var `VUE_APP_API_URL`
17. SST `StaticSite` injects API URL at build time
18. Custom domain: `carousel.code4real.org` via CloudFront

### Phase 6: SST Config
19. Full `sst.config.ts` with:
    - `Secret` for DATABASE_URL, JWT_SECRET
    - `Bucket` for uploads
    - `Api` with custom domain `api.code4real.org`
    - `StaticSite` with custom domain `carousel.code4real.org`

### Phase 7: Deploy & Test
20. `sst dev` for local development
21. `sst deploy --stage staging` → test all flows
22. `sst deploy --stage prod`

## Notes & Risks
- **Vue 2 is EOL** — works for now, consider Vue 3 upgrade later
- **Cold starts:** ~500ms-1s with full Express wrap; acceptable, optimize later
- **student.model.js** looks like denormalized legacy (poas1/sig1/bio1...) — confirm if dead code
- **PlanetScale free tier** may be sufficient initially; upgrade as needed
