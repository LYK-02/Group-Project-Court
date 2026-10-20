# Product Requirements Document (PRD)

## 1. Summary

Group Project Court is a playful web app for student teams. Members organize tasks, create a fictional or consent-based case, submit evidence notes, vote on a verdict, and view a humorous case summary.

It is an entertainment and portfolio product, not a formal disciplinary or academic-integrity system. Verdicts are team polls, not objective proof of effort or misconduct.

## 2. Problem

Group projects can create frustration when responsibilities are unclear. Ordinary task boards are useful but rarely make the experience engaging. This product wraps task tracking and structured discussion in a mock courtroom concept.

## 3. Product principles

1. Funny on the surface, serious underneath.
2. Privacy by default.
3. Server-authoritative permissions and verdicts.
4. Explainable, reproducible business rules.
5. A complete, secure vertical slice before optional features.

## 4. Target users and roles

- **Owner:** creates a team, manages invites, and closes cases.
- **Member:** manages permitted tasks, submits evidence, and votes.
- **Public viewer:** sees only a deliberately published, sanitized case summary.
- **System:** validates input, enforces permissions, records audit events, and calculates verdicts.

## 5. Goals and success measures

- Complete the core experience within one week.
- A user can register, create a team, invite a member, manage tasks, open a case, vote, and view a saved verdict.
- Unauthorized users cannot access private team data.
- Core workflows have automated tests.
- The deployed demo works in a fresh browser session.
- A mentor can understand the architecture from the README and a short walkthrough.

## 6. MVP scope (P0)

### Authentication
- Register, log in, log out, and retrieve current-user details.
- Store password hashes only.
- Use secure, revocable sessions.

### Teams and membership
- Create teams and list teams the current user belongs to.
- Generate, rotate, expire, and revoke invite codes.
- Join using a valid invite.
- Prevent duplicate membership and unauthorized changes.

### Tasks
- Create, read, update, and delete tasks.
- Track title, description, assignee, status, creator, and timestamps.
- Assignee must belong to the same team.
- Record significant changes in an audit trail.

### Cases and evidence
- Create, view, and close cases.
- Submit evidence notes or HTTPS URLs.
- Private team access is the default.
- User-provided evidence is not treated as verified fact.

### Voting and verdict
- One active vote per eligible team member per case.
- Voting is allowed only while a case is open.
- Server calculates and stores the verdict.
- Store the rule version and tally used.

### Sharing
- Publishing is opt-in.
- Public endpoint returns allowlisted fields only.
- Share links can be revoked.
- Never expose private evidence, emails, invite tokens, session data, or internal audit metadata.

## 7. P1 and P2

**P1, only after P0 is stable:** Socket.IO updates, pagination/search, printable verdict, charts, in-app notifications.

**P2:** AI-assisted humorous phrasing using sanitized authorized data, email notifications, PWA, advanced analytics.

## 8. Non-goals

- Official university discipline decisions.
- Public shaming, anonymous mass-reporting, or doxxing.
- Video/audio calls.
- Payments or monetization.
- Microservices.
- AI determining factual guilt or a person's character.

## 9. Core journeys

### Create a team
1. Register and sign in.
2. Create a team.
3. Server creates owner membership.
4. Owner creates an invite.
5. Another user joins through the invite.
6. Team dashboard shows members and tasks.

### Track contributions
1. Create a task and assign a team member.
2. Update status as work progresses.
3. Show task history and summary.
4. Avoid treating task count as a complete measure of effort.

### Open and close a case
1. A team member creates a case.
2. Members submit relevant evidence notes.
3. Eligible members vote once.
4. Owner closes the case.
5. Server calculates and persists a deterministic result.
6. Team views the result privately or publishes a sanitized summary.

## 10. Business rules

1. Each team has one owner in the MVP.
2. Only valid active invitations can create membership.
3. Only team members can access private team resources.
4. Task assignees must belong to the task's team.
5. Only team members can submit evidence and vote.
6. A database uniqueness constraint enforces one vote per user per case.
7. Closed cases reject additional votes.
8. Closing is concurrency-safe and idempotent.
9. Public sharing is opt-in and field-allowlisted.
10. Use fictional/demo data for presentations whenever possible.
11. Verdicts are satirical summaries, not formal findings.

## 11. Acceptance criteria

A feature is complete when the happy path works, server validation and authorization are in place, loading/empty/error/success states exist, relevant tests pass, no secrets leak, and documentation is updated.
