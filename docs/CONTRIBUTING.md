# Contributing and Project Workflow

## 1. Workflow

1. Pick one scoped issue or feature.
2. Confirm acceptance criteria.
3. Create a feature branch.
4. Implement the smallest complete change.
5. Add or update tests.
6. Run lint, tests, and build.
7. Review `git diff`.
8. Update documentation if behavior/configuration changed.
9. Commit with a descriptive message.
10. Merge only when the branch is in a working state.

## 2. Branch names

Examples:
- `feat/auth-session`
- `feat/team-invites`
- `feat/case-voting`
- `fix/public-share-leak`
- `test/cross-team-access`
- `docs/design-system`

## 3. Commit conventions

```text
feat(cases): add case creation
fix(auth): rotate session after login
test(votes): cover concurrent duplicate votes
docs(api): document case endpoints
```

## 4. Pull request checklist

- [ ] Purpose and behavior are described.
- [ ] Acceptance criteria are met.
- [ ] Validation and authorization are enforced server-side.
- [ ] Tests cover normal and failure paths.
- [ ] No secrets or private data are included.
- [ ] UI is accessible and responsive.
- [ ] Lint, tests, and build pass.
- [ ] Documentation is updated.
- [ ] Known limitations are stated.

## 5. Definition of done

See [Coding Standards](CODING_STANDARDS.md#8-definition-of-done). A feature is not done merely because it works on the developer's machine.
