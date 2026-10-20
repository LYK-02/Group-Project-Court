# Project Memory & Developer Preferences

## 1. User IDE Preferences & Settings

Imported from `/home/laik/.config/Code/User/settings.json` into `/home/laik/.config/Antigravity IDE/User/settings.json`:

- **Theme & Appearance:**
  - `workbench.colorTheme`: `"Cursor Dark Core"`
  - `workbench.iconTheme`: `"mizu"`
  - `window.menuBarVisibility`: `"compact"`
  - `workbench.activityBar.location`: `"top"`
  - `glassit.alpha`: `220`
- **Editor Settings:**
  - `editor.fontSize`: `18`
  - `editor.wordWrap`: `"on"`
  - `editor.mouseWheelZoom`: `true`
  - `editor.minimap.enabled`: `false`
  - `editor.stickyScroll.enabled`: `false`
  - `editor.cursorBlinking`: `"phase"`
  - `editor.cursorSmoothCaretAnimation`: `"on"`
  - `files.autoSave`: `"afterDelay"`
  - `editor.defaultFormatter`: `"esbenp.prettier-vscode"`
- **Git & Terminal:**
  - `git.autofetch`: `true`
  - `git.confirmSync`: `false`
  - `git.suggestSmartCommit`: `false`
  - `terminal.integrated.mouseWheelScrollSensitivity`: `3`

---

## 2. Neon Serverless PostgreSQL Configuration

- **Organization ID:** `org-morning-rain-49427514`
- **Project ID:** `young-moon-49945213`
- **Default Branch:** `production`
- **Connection Strategy (Best Practice from Neon Skill):**
  - **`DATABASE_URL_UNPOOLED` (Direct Connection):** Used exclusively for DDL, migrations, and seeds (`database/migrate.js`, `database/seed.js`). Direct connection bypasses PgBouncer transaction-mode session limitations.
  - **`DATABASE_URL` (Pooled Connection):** Used for normal web application runtime query traffic via PgBouncer. Configured in `server/src/config/db.js` with `ssl: { rejectUnauthorized: false }`.
- **Verified Neon Status:**
  - PostgreSQL Version: `PostgreSQL 18.6`
  - End-to-end verified via `/api/v1/health` returning `provider: "Neon Serverless Postgres"`.

---

## 3. Project Architecture & Stack

- **Frontend:** React 18 + Vite (SPA)
  - Styling: Tailwind CSS Neo-brutalist design tokens (`#FFFDF5` canvas, `#FF6B6B` hot red, `#FFD93D` vivid yellow, `#C4B5FD` soft violet, hard shadows `4px`, `6px`, `8px`, `12px`, 3px borders)
  - Components: `Button`, `Card`, `Badge`, `FormField`, `VerdictStamp`, `Navbar`
  - Typography: Space Grotesk
- **Backend:** Node.js + Express REST API (`/api/v1`)
  - Middleware: Request ID tracking (`X-Request-Id`), structured duration logger, Helmet security headers, rate limiting, and centralized error handler
- **Database:** PostgreSQL on Neon
  - Tables: `users`, `teams`, `team_members`, `team_invites`, `tasks`, `cases`, `evidence`, `votes`, `audit_events`
  - Constraints: Unique `(case_id, user_id)` vote constraint, foreign keys with cascade rules, check constraints on roles and status
- **Quality Gates:**
  - `npm run lint`: ESLint flat config with React, hooks, and Node support (0 errors, 0 warnings)
  - `npm run test:all`: Vitest test suites across server and client (8 passing)
  - `npm run build`: Production bundle built cleanly

---

## 4. Git & Delivery Rules

- **Branch Naming:** `feat/phase-<N>-<topic>` (e.g. `feat/phase-1-foundation`)
- **Granular Commits:** Upload and commit files individually with semantic commit messages (`feat(...)`, `test(...)`, `fix(...)`, `docs(...)`) rather than monolithic bulk commits.
- **Pull Requests:** Open a PR on GitHub per phase with a structured description checklist.
- **Phase Status:**
  - [x] Phase 1: Foundation & Design (Merged / PR #3)
  - [ ] Phase 2: Authentication & Teams (Registration, sessions, invite tokens, dashboard)
  - [ ] Phase 3: Tasks & Audit History
  - [ ] Phase 4: Cases, Evidence, Voting & Verdicts
  - [ ] Phase 5: Courtroom UI Polish & Sharing
  - [ ] Phase 6: Testing, Hardening & Deployment
  - [ ] Phase 7: Demo Readiness
