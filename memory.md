# Project Memory — Group Project Court

## 1. Project Overview & Operating Directives

- **Repository**: `LYK-02/Group-Project-Court`
- **Application**: "Group Project Court" — A satirical yet functional student accountability courtroom web application where teams track tasks, raise dispute cases for missed deadlines or non-contribution, present evidence, vote, and issue binding verdicts.
- **Core Operating Mandates**:
  1. **Zero Mistakes**: Every phase must be rigorously validated with passing linters, unit/integration tests, and builds before completion.
  2. **Incremental Delivery**: Commit and push files **one by one** with descriptive, conventional commit messages. Never commit everything in a single bulk commit.
  3. **Phase-by-Phase PRs**: Each phase is developed on its own dedicated feature branch with an active Pull Request tracking progress.

---

## 2. User IDE Preferences & Settings

Imported from `/home/laik/.config/Code/User/settings.json` into `/home/laik/.config/Antigravity IDE/User/settings.json` (53 preferences configured):

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
  - `editor.formatOnSave`: `true`
- **Git & Terminal:**
  - `git.autofetch`: `true`
  - `git.confirmSync`: `false`
  - `git.suggestSmartCommit`: `false`
  - `terminal.integrated.mouseWheelScrollSensitivity`: `3`

---

## 3. Technology Stack & Design System

- **Backend**:
  - Node.js (ES Modules, Node 20+)
  - Express.js (v4)
  - PostgreSQL driver: `pg` (v8)
  - Session auth: `express-session` with secure HTTP-only cookies (`gpc.sid`)
  - Password hashing: `bcryptjs` (salt rounds: 12)
  - Request validation: `zod` (v3)
  - Security & Logging: `helmet`, `cors`, `pino`, `pino-pretty`, `express-rate-limit`
  - Testing: Node test runner (`node --test`), Supertest, Vitest
- **Frontend**:
  - React 19 + Vite 6
  - Tailwind CSS v4 + Vanilla CSS custom properties
  - Icons: `lucide-react`
  - Testing: Vitest + React Testing Library + `@testing-library/jest-dom` + `jsdom`
- **Database & Cloud**:
  - Neon Serverless Postgres
  - Org ID: `org-morning-rain-49427514`
  - Project ID: `young-moon-49945213`
  - Default Branch: `production`
- **Design Language**:
  - **Neo-brutalism** (per `docs/DESIGN.md`):
    - Warm parchment canvas (`#FFFDF5`)
    - Hard black borders (`3px solid #000000`)
    - Crisp unblurred drop shadows (`4px 4px 0px #000000`, `6px 6px 0px #000000`, `8px 8px 0px #000000`)
    - Accent colors: Electric Yellow (`#FFE500`), Crimson Alert (`#FF3B30`), Mint Defense (`#34C759`), Legal Blue (`#0055FF`), Soft Violet (`#C4B5FD`)
    - Typography: Space Grotesk (display), Inter (body), Space Mono (verdicts/tokens)

---

## 4. Architectural Rules & Best Practices

1. **Neon Connection Strategy (Best Practice from Neon Skill)**:
   - **`DATABASE_URL_UNPOOLED` (Direct Connection):** Used exclusively for DDL, migrations, and seeds (`database/migrate.js`, `database/seed.js`). Direct connection bypasses PgBouncer transaction-mode session limitations and lock handling.
   - **`DATABASE_URL` (Pooled Connection):** Used for normal web application runtime query traffic via PgBouncer. Configured in `server/src/config/db.js` with `ssl: { rejectUnauthorized: false }`.
2. **Security & Authentication**:
   - Passwords hashed with `bcryptjs` (salt rounds: 12).
   - Session cookies: `httpOnly: true`, `sameSite: 'lax'`, `secure: production`.
   - Never expose raw invite tokens in database or responses; store SHA-256 hashes (`token_hash`).
   - Authentication errors must return uniform messages (`"Invalid email or password."`) to eliminate user enumeration vulnerabilities.
   - Transactional integrity: Any multi-row mutation (e.g. creating team + inserting creator as owner) must use explicit `BEGIN ... COMMIT/ROLLBACK` blocks.

---

## 5. Phase Execution Tracker

| Phase | Description | Status | Git Branch / PR | Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Foundation and Design: Monorepo, database schema, Neon cloud connection, health checks, design tokens, UI shell. | **Done (Merged)** | `main` (PR #1, #2, #3 merged) | Migrations passed on Neon, live health check verified, 100% tests passing. |
| **Phase 2** | Authentication and Teams: User register/login/logout, team management, invite codes, role authorization, team dashboard. | **Done (Merged)** | `main` (PR #6 merged) | 29 server integration tests passing, 9 client tests passing, 100% lint & Vite build verified. |
| **Phase 3** | Tasks & Audit History: Task CRUD, status updates, team assignment verification, immutable audit events log. | **Done (Merged)** | `main` (PR #7 merged) | 9 integration tests passing, assignee membership validation, transaction rollback, audit trail tracking. |
| **Phase 4** | Cases, Evidence, Voting & Verdict: Dispute cases, evidence exhibits (note/URL), single-vote constraint, concurrency-safe verdict engine. | **Done (Merged)** | `main` (PR #7 merged) | 12 integration tests passing, FOR UPDATE concurrency locking, satirical consensus calculations, public token hashing. |
| **Phase 5** | UI Polish & Public Sharing: Neo-brutalist Courtroom docket, interactive TaskBoard Kanban, AuditTimeline ledger, PublicVerdictView. | **Done (Merged)** | `main` (PR #7 merged) | 5 client component tests passing, tactile buttons, verdict stamp, full desktop & mobile navigation. |
| **Phase 6** | Testing, Hardening & Deployment: Security audits, stress testing, end-to-end flows, production verification. | **Done (Merged)** | `main` (PR #7 merged) | 64/64 tests passing across monorepo (50 server + 14 client), 0 lint errors, production Vite build verified. |
| **Phase 7** | Demo Readiness: Seed fictional courtroom showcase, demo scripts, architecture walkthrough, documentation freeze. | **Done (Merged)** | `main` (PR #7 merged) | Neon live database seeded (`001_demo_seed.sql`), 3-minute walkthrough script in README, documentation frozen. |

---

## 6. Installed Skills & Tooling

- Installed Neon Agent Skills (in `.agents/skills/`):
  - `neon`: Core Neon Postgres platform guide
  - `neon-auth`: Neon serverless auth
  - `neon-branch-preview`: Ephemeral branch preview workflow
  - `neon-cli`: Neon CLI interaction
  - `neon-data-api`: Neon serverless HTTP data API
  - `neon-database-mcp`: MCP database connectivity
  - `neon-functions`: Serverless functions
  - `neon-pg-indexes`: Index optimization
  - `neon-pg-tuning`: Query performance tuning
- Pinned in `skills-lock.json`.
