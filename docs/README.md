# Group Project Court

**Justice for the Carrying Member.**

A satirical, full-stack student-team collaboration app. Teams manage tasks, open playful cases about contribution disputes, submit evidence, vote, and generate a transparent verdict.

The humour is the wrapper; the engineering is real: authentication, authorization, relational data, transactions, validation, audit events, tests, and deployment.

## Documentation map

- [PRD](PRD.md) — product goals, users, features, acceptance criteria.
- [TRD](TRD.md) — technology and implementation requirements.
- [Architecture](ARCHITECTURE.md) — system boundaries, request flow, modules.
- [Design system](DESIGN.md) — neo-brutalist visual language and UI rules.
- [Database](DATABASE.md) — entities, relationships, constraints, indexes.
- [API](API.md) — REST endpoint contract and response conventions.
- [Security](SECURITY.md) — threat controls and security checklist.
- [Coding standards](CODING_STANDARDS.md) — maintainability and Git rules.
- [Phases](PHASES.md) — seven-day implementation schedule.
- [Testing and deployment](TESTING_DEPLOYMENT.md) — quality gates and launch checklist.
- [Contributing](CONTRIBUTING.md) — workflow and definition of done.

## Suggested stack

React + Vite + Tailwind CSS, Node.js + Express, PostgreSQL, Zod, server-side sessions, Vitest, Supertest, and Playwright. Socket.IO is optional after the core flow works.

## Local development (high-level)

1. Install a supported Node.js LTS release and PostgreSQL.
2. Copy `.env.example` to `.env` and set local values.
3. Install dependencies in `client/` and `server/`.
4. Run database migrations and seed fictional demo data.
5. Start the API and frontend.
6. Run linting and tests before opening a pull request.

See the individual docs for requirements. This repository is a portfolio project, not an official university disciplinary system. Use fictional identities for public demos and do not publish sensitive or non-consensual content.
