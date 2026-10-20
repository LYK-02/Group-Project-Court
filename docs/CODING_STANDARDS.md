# Coding Standards and Good Practices

## 1. General rules

1. Prefer readable code over clever code.
2. Keep functions focused on one responsibility.
3. Separate HTTP concerns from domain logic and database access.
4. Use descriptive names such as `closeCase`, `castVote`, and `createTeam`.
5. Avoid giant files and components.
6. Centralize shared authorization checks and test them.
7. Never trust client-calculated totals, roles, or verdicts.
8. Avoid request-specific global mutable state.
9. Handle expected errors explicitly and unexpected errors centrally.
10. Never silently swallow exceptions.
11. Keep dependency count modest.
12. Document non-obvious rules and trade-offs, not every line.
13. Remove debug logs and dead code before merging.

## 2. JavaScript and types

- Use ES modules consistently.
- Prefer `const`; use `let` only when reassignment is needed.
- Avoid `var`.
- Use strict lint rules where practical.
- If TypeScript is adopted, avoid `any` and validate runtime input anyway.
- Define explicit service return shapes.
- Handle nullability consistently.
- Store timestamps consistently and make time-zone assumptions explicit.

## 3. Backend responsibilities

### Routes
Define method/path and attach required middleware.

### Controllers
Read validated input and authenticated identity, call services, and return HTTP responses. Keep business rules out of controllers.

### Services
Implement domain rules and transactions. Keep them testable without HTTP.

### Repositories
Encapsulate parameterized queries when helpful. Select only required columns.

### Validators
Define schemas for params, query strings, and bodies.

Do not add layers that only forward calls without improving clarity.

## 4. Frontend practices

- Organize code by feature.
- Build reusable buttons, fields, cards, status labels, and dialogs.
- Separate server state from temporary UI state.
- Include loading, empty, error, and success states.
- Disable submit controls while requests are in progress, but still enforce correctness on the server.
- Use accessible labels, keyboard navigation, visible focus, and adequate contrast.
- Never store secrets or make security decisions in frontend code.
- Use a shared API client for base URL and error handling.
- Make layouts responsive.

## 5. Database and API practices

- Use parameterized SQL.
- Validate and authorize before side effects.
- Use database constraints as well as service checks.
- Use transactions for multi-step writes.
- Avoid `SELECT *` in public response paths.
- Avoid N+1 queries; paginate large lists.
- Create migrations for every schema change.
- Make retryable operations idempotent where appropriate.
- Add indexes based on query patterns.

## 6. Error handling

- Use a consistent error shape.
- Give users actionable messages without exposing internals.
- Log unexpected errors with a request ID.
- Distinguish validation, authentication, authorization, conflict, and internal errors.
- Roll back failed transactions.
- Never return raw SQL errors or production stack traces.
- Do not report success before persistence succeeds.

## 7. Git workflow

Example commit messages:

```text
feat(auth): add session-based login
feat(teams): add invite-code joining
feat(cases): implement case closure transaction
fix(votes): prevent duplicate votes
test(auth): cover cross-user access
docs: add deployment instructions
```

Rules:
- Keep `main` deployable.
- Use feature branches for meaningful changes.
- Make commits small and purposeful.
- Review `git diff` before committing.
- Never commit secrets, database dumps, or user data.
- Run lint and tests before merging.
- Document trade-offs and limitations.

## 8. Definition of done

- [ ] Requirement and acceptance criteria are clear.
- [ ] Code is readable and reviewed.
- [ ] Server validates input and checks authorization.
- [ ] Constraints and transactions are correct.
- [ ] Normal and failure paths are tested.
- [ ] UI has loading, empty, error, and success states.
- [ ] No secrets or private data are exposed.
- [ ] Lint and tests pass.
- [ ] Documentation is updated.
- [ ] Feature works in the deployed environment.
