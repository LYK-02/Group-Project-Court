# Group Project Court

> **Justice for the Carrying Member.**  
> A satirical, full-stack student-team collaboration app for managing tasks, opening peer-reviewed contribution disputes, submitting verified evidence notes, and calculating community verdicts.

[![CI Status](https://img.shields.io/badge/Status-All%20Phases%20Verified%20%26%20Complete-green.svg)](#-seven-day-delivery-roadmap)
[![Design Style](https://img.shields.io/badge/Design-Neo--brutalism-FF6B6B.svg)](docs/DESIGN.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFD93D.svg)](#disclaimer)

---

## 🏛️ Overview

Group projects can create frustration when responsibilities and contributions become ambiguous. Group Project Court wraps team task tracking and consensus discussion in a mock-courtroom aesthetic:

1. **The Courtroom Wrapper:** Theatrical mock trials, sticker badges, gavel stamps, and satirical jury verdicts.
2. **Production-Grade Engineering Underneath:** Server-authoritative sessions, PostgreSQL relational integrity, database constraints, input schemas, multi-step transaction safety, audit logging, and automated test coverage.

> [!NOTE]  
> **Academic & Portfolio Disclaimer:** This repository is an entertainment and portfolio product, not a university disciplinary body. Peer verdicts are playful polls, not objective legal or academic findings.

---

## 🏗️ Architecture & Stack

```
Group-Project-Court/
├── client/              # React 18 + Vite SPA, Tailwind CSS Neo-brutalism, Vitest
│   ├── src/
│   │   ├── app/         # Shell and routing
│   │   ├── components/  # Button, Card, Badge, FormField, VerdictStamp, Navbar
│   │   ├── features/    # Auth, teams, tasks, cases, voting
│   │   ├── lib/         # Shared API client and utilities
│   │   └── styles/      # Neo-brutalist tokens and CSS variables
├── server/              # Node.js + Express REST API, PostgreSQL, Zod, Helmet
│   ├── src/
│   │   ├── config/      # Validated env, pg connection pool, health check
│   │   ├── middleware/  # Request ID, structured logger, centralized error handler
│   │   ├── routes/      # Versioned routes (/api/v1/health, auth, teams, tasks, cases)
│   │   └── utils/       # AppError hierarchy
│   └── test/            # Vitest + Supertest integration tests
├── database/            # Database migrations & demo fixtures
│   ├── migrations/      # 001_initial_schema.sql
│   ├── seeds/           # 001_demo_seed.sql (fictional student team data)
│   ├── migrate.js       # Transactional migration runner
│   └── seed.js          # Demo seed runner
└── docs/                # Comprehensive engineering and design documentation
```

### Technology Matrix

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast HMR, responsive UI |
| **Styling** | Tailwind CSS + CSS Variables | Neo-brutalism: `#FFFDF5` canvas, hard drop shadows, 3px borders |
| **Backend API** | Node.js + Express | Modular monolith REST API prefixed at `/api/v1` |
| **Validation** | Zod | Runtime schema validation for params, queries, and bodies |
| **Database** | PostgreSQL | Relational constraints, UUID keys, transactions |
| **Security** | Helmet, CORS, Rate Limiters | Isolated origin, security headers, request IDs |
| **Testing** | Vitest + Testing Library + Supertest | Unit and integration test suites |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`
- **PostgreSQL**: `>= 14` (or managed PostgreSQL instance like Supabase / Neon)

### 1. Clone & Configure

```bash
git clone https://github.com/LYK-02/Group-Project-Court.git
cd Group-Project-Court
cp .env.example .env
```

Review `.env` and configure your local PostgreSQL connection credentials:

```dotenv
NODE_ENV=development
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/group_project_court
SESSION_SECRET=your-secure-development-session-secret-min-16-chars
```

### 2. Install Dependencies

Install root, backend, and frontend packages:

```bash
# Root orchestration dependencies
npm install

# Backend server dependencies
npm --prefix server install

# Frontend client dependencies
npm --prefix client install
```

### 3. Run Migrations & Seeds

```bash
# Apply initial database schema (tables, foreign keys, unique vote constraints, indexes)
npm run db:migrate

# Seed fictional demo team, tasks, case, and evidence
npm run db:seed
```

### 4. Start Development Servers

Run both Express API and Vite React frontend concurrently:

```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **API Health Check:** [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

---

## 🧪 Testing & Quality Gates

Run automated integration test suites:

```bash
# Run server integration tests (Vitest + Supertest)
npm --prefix server test

# Run client component & shell tests (Vitest + Testing Library)
npm --prefix client test

# Run linters across both workspaces
npm run lint

# Build client production bundle
npm run build
```

---

## 📅 Seven-Day Delivery Roadmap

- [x] **Day 1 — Foundation & Design:** Scaffolding, PostgreSQL schema migrations, health endpoint, neo-brutalist design tokens, tactile components, and automated test runners.
- [x] **Day 2 — Authentication & Teams:** Registration, secure session management, team creation, and invite tokens.
- [x] **Day 3 — Tasks & Audit Trail:** Task CRUD, assignee verification, and audit event logs.
- [x] **Day 4 — Cases, Evidence & Verdicts:** Case lifecycle, evidence submission, one-vote-per-user constraint, and transaction-safe verdict calculation.
- [x] **Day 5 — Courtroom UI Polish & Sharing:** Responsive jury voting screen, verdict reveals, sanitized public summaries.
- [x] **Day 6 — Hardening & End-to-End Testing:** Access control verification, injection checks, and deployment.
- [x] **Day 7 — Presentation & Demo Readiness:** Seeded demo walkthrough, frozen code, and mentor guide.

---

## 🎭 Fictional Courtroom Demo Showcase & 3-Minute Walkthrough

The repository includes a ready-to-run fictional student team demonstration seeded directly into PostgreSQL / Neon:

### Demo Credentials
All seeded users share the development password: `Password123!`

| Role / Persona | Name | Email |
| :--- | :--- | :--- |
| **Team Owner (The Carry)** | Alex Rivera | `alex@demo.court` |
| **Accused Teammate (The Ghost)** | Jordan Lee | `jordan@demo.court` |
| **Witness / Juror (The Scribe)** | Taylor Kim | `taylor@demo.court` |

### 3-Minute Evaluation Walkthrough
1. **Accredited Witness Sign-In:**
   - Log in with `alex@demo.court` / `Password123!`.
   - The active team **"CS 401: Distributed Consensus Calamity"** automatically loads.
2. **Task Deliverables & Kanban (Phase 3):**
   - Click **Tasks** in the top navigation.
   - Inspect the 3 columns: *Done* (Raft consensus by Alex), *In Progress* (Architecture deck by Taylor), and *To-Do* (Integration tests unstarted by Jordan).
3. **Dispute Docket & Juror Deliberation (Phase 4 & 5):**
   - Click **Courtroom** in the top navigation.
   - Click **Enter Courtroom** on case *"The Mystery of the Missing Load-Balancer Tests"*.
   - Review admitted evidence notes citing 0 commits from Jordan over 3 weeks.
   - Cast a juror vote (**Unfair / Impose Duty** or **Needs Review**).
4. **Bench Ruling & Theatrical Verdict:**
   - Click **Deliver Verdict & Close Trial** (Owner privilege).
   - The court tallies consensus and stamps an official **GUILTY** or **ACQUITTED** verdict with satirical penalties (mandatory merge conflict duty and sprint coffee delivery).
5. **Public Summons & Sharing (Phase 5):**
   - Click **Generate Share Link** -> Copy the URL or click **View Public Page**.
   - Observe the sanitized public dossier: zero authentication required, privacy protected (no emails or internal tokens exposed).
6. **Forensic Audit Ledger (Phase 3):**
   - Click **Audit Ledger** in navigation to review immutable cryptographic activity logs.

---

## 📚 Documentation Bundle

For full architecture contracts and implementation details, refer to the [docs/](docs/) directory:
- [INDEX.md](docs/INDEX.md) — Documentation index
- [PRD.md](docs/PRD.md) — Product requirements and user journeys
- [TRD.md](docs/TRD.md) — Technical requirements and error contracts
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — Monolith layer diagrams
- [DATABASE.md](docs/DATABASE.md) — Relational schemas and constraints
- [DESIGN.md](docs/DESIGN.md) — Neo-brutalist design system specifications
- [SECURITY.md](docs/SECURITY.md) — Threat model and security checklist
- [CODING_STANDARDS.md](docs/CODING_STANDARDS.md) — Style guide and Git workflow
- [PHASES.md](docs/PHASES.md) — Daily execution schedule