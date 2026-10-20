# Delivery Phases — Seven-Day Plan

Assume 4–6 focused hours per day. Finish the core vertical slice before optional features.

## Day 1 — Foundation and design

- Create repository, README, `.gitignore`, `.env.example`.
- Scaffold React/Vite and Express.
- Configure linting, formatting, and test scripts.
- Set up PostgreSQL and migrations.
- Add health endpoint.
- Implement design tokens and basic shell.

**Exit:** client and server run; database connects; migrations work from a clean database; no secrets committed.

## Day 2 — Authentication and teams

- Registration, login, logout, current user.
- Secure sessions and authentication middleware.
- Team creation and membership.
- Invite creation, joining, expiry, and revocation.
- Basic dashboard.

**Exit:** users can create teams and join valid invites; non-members cannot access private team data; tests pass.

## Day 3 — Tasks and audit history

- Task CRUD and status changes.
- Validate assignees against team membership.
- Record significant changes.
- Build task list and controls.

**Exit:** tasks persist; cross-team access is denied; validation and permission tests pass.

## Day 4 — Cases, evidence, voting, verdict

- Case creation and state transitions.
- Evidence submission and privacy rules.
- One-vote-per-user constraint.
- Transaction-safe case closure and verdict persistence.
- Case history.

**Exit:** concurrent duplicate votes are prevented; closed cases reject votes; verdict and audit event persist consistently.

## Day 5 — UI polish and sharing

- Responsive courtroom interface.
- Loading, empty, error, and success states.
- Funny verdict copy and fictional seed data.
- Sanitized public summary and revocation.
- Optional print view.

**Exit:** main journey works on desktop and mobile; public responses do not expose private fields.

## Day 6 — Testing, hardening, deployment

- Unit, integration, and core end-to-end tests.
- Test access control and validation.
- Deploy frontend, API, and database.
- Configure environment variables and migrations.
- Verify health endpoint and logs.

**Exit:** production app works in a fresh browser; critical tests pass; no secrets leak.

## Day 7 — Demo readiness

- Fix critical bugs; freeze new features.
- Seed fictional demo team and case.
- Complete README, API notes, and architecture diagram.
- Rehearse a three-minute walkthrough.
- Verify voting, verdict, sharing, and access control.

**Exit:** demo is repeatable; developer can explain architecture, data model, security, and trade-offs.

## Scope cuts if behind

1. Remove AI.
2. Remove Socket.IO and use refresh/polling.
3. Remove charts and downloadable reports.
4. Simplify analytics.
5. Keep authentication, membership checks, tasks, cases, votes, verdicts, and tests.

Never cut authorization, database constraints, secret handling, or reproducible setup.
