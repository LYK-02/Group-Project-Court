# Project Memory — Group Project Court

## 1. Project Overview & Directives

- **Repository**: `LYK-02/Group-Project-Court`
- **Application**: "Group Project Court" — A satirical yet functional student accountability courtroom web application where teams track tasks, raise cases for missed deadlines or low contribution, present evidence, vote, and issue binding verdicts.
- **Core Operating Mandates**:
  1. **Zero Mistakes**: Every phase must be rigorously validated with passing linters, unit/integration tests, and builds before completion.
  2. **Incremental Delivery**: Commit and push files **one by one** with descriptive, conventional commit messages. Never commit everything in a single bulk commit.
  3. **Phase-by-Phase PRs**: Each phase is developed on its own dedicated feature branch with an active Pull Request tracking progress.

---

## 2. User Preferences & Environment Settings

- **Antigravity IDE User Settings**: Imported from user's VS Code setup into `~/.config/Antigravity IDE/User/settings.json` (53 preferences configured):
  - `editor.fontSize`: 18
  - `files.autoSave`: "afterDelay"
  - `editor.mouseWheelZoom`: true
  - `workbench.editor.enablePreview`: false
  - `workbench.activityBar.location`: "top"
  - `editor.minimap.enabled`: false
  - `editor.stickyScroll.enabled`: false
  - `glassit.alpha`: 220
  - `editor.cursorSmoothCaretAnimation`: "on"
  - `editor.formatOnSave`: true
  - `git.confirmSync`: false
  - `git.suggestSmartCommit`: false

---

## 3. Technology Stack & Design System

- **Backend**:
  - Node.js (ES Modules, Node 20+)
  - Express.js (v4)
  - PostgreSQL driver: `pg` (v8)
  - Session auth: `express-session` with secure HTTP-only cookies
  - Password hashing: `bcryptjs`
  - Validation: `zod` (v3)
  - Security & Logging: `helmet`, `cors`, `pino`, `pino-pretty`, `express-rate-limit`
  - Testing: Node test runner (`node --test`), Supertest
- **Frontend**:
  - React 19 + Vite 6
  - Tailwind CSS v4 + Vanilla CSS custom properties
  - Icons: `lucide-react`
  - Testing: Vitest + React Testing Library + `@testing-library/jest-dom` + `jsdom`
- **Database & Cloud**:
  - Neon Serverless Postgres
  - Org ID: `org-morning-rain-49427514`
  - Project ID: `young-moon-49945213`
  - Branch: `production`
- **Design Language**:
  - **Neo-brutalism** (per `docs/DESIGN.md`):
    - Warm parchment canvas (`#FFFDF5`)
    - Hard black borders (`3px solid #000000`)
    - Crisp unblurred drop shadows (`4px 4px 0px #000000`, `6px 6px 0px #000000`)
    - Accent colors: Electric Yellow (`#FFE500`), Crimson Alert (`#FF3B30`), Mint Defense (`#34C759`), Legal Blue (`#0055FF`)
    - Typography: Space Grotesk (display), Inter (body), Space Mono (verdicts/tokens)

---

## 4. Architectural Rules & Best Practices

1. **Neon Connection Strategy**:
   - **Migrations & Seeds** (`database/migrate.js`, `database/seed.js`): MUST use direct, unpooled connection (`DATABASE_URL_UNPOOLED` without `-pooler`). PgBouncer in transaction pooling mode fails on migration locks and session commands.
   - **Application Traffic** (`server/src/config/db.js`): Uses pooled connection (`DATABASE_URL`) with `ssl: { rejectUnauthorized: false }`.
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
| **Phase 2** | Authentication and Teams: User register/login/logout, team management, invite codes, role authorization, team dashboard. | **Done** | `feat/phase-2-auth-and-teams` (PR #4) | 29 server integration tests passing, 9 client tests passing, 100% lint & Vite build verified. |
| **Phase 3** | Tasks & Audit History: Task CRUD, status updates, team assignment verification, audit events log. | Pending | TBD | Pending |
| **Phase 4** | Cases, Evidence, Voting & Verdict: Dispute cases, evidence uploads, single-vote constraint, verdict engine. | Pending | TBD | Pending |
| **Phase 5** | UI Polish & Public Sharing: Courtroom UI, responsive layouts, empty/loading states, sanitized public shares. | Pending | TBD | Pending |
| **Phase 6** | Testing, Hardening & Deployment: Security audits, stress testing, end-to-end flows, production verification. | Pending | TBD | Pending |
| **Phase 7** | Demo Readiness: Seed fictional courtroom showcase, demo scripts, architecture walkthrough, documentation freeze. | Pending | TBD | Pending |

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
