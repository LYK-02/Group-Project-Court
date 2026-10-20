# Testing and Deployment

## 1. Testing strategy

### Unit tests
- Verdict calculation and tie policy.
- Input schemas.
- Permission helpers.
- Invite expiry.
- Public response sanitization.

### Integration tests
- Registration and login.
- Team creation and invite joining.
- Task ownership and assignee validation.
- Evidence submission and visibility.
- Duplicate voting and case closure.
- Public link creation and revocation.
- Cross-team authorization.

### End-to-end test
1. Sign in.
2. Create a team.
3. Create a task.
4. Create a case.
5. Submit evidence.
6. Cast votes as eligible members.
7. Close the case.
8. Verify the verdict.
9. Publish a sanitized summary.
10. Revoke the link and verify access fails.

Use an isolated test database. Never run destructive tests against production.

## 2. Deployment model

A simple deployment can use:
- Frontend: a static hosting provider compatible with Vite.
- API: a Node.js hosting service.
- Database: managed PostgreSQL.

Verify current provider free-tier limits, sleeping behavior, connection limits, and backup options before choosing a plan.

## 3. Production checklist

- [ ] Frontend and backend use HTTPS.
- [ ] Production PostgreSQL is configured.
- [ ] Secrets are set in the hosting dashboard.
- [ ] Migrations run successfully.
- [ ] CORS allows only the intended frontend origin.
- [ ] Secure cookies and CSRF protection are configured for the chosen auth strategy.
- [ ] Health endpoint does not expose secrets.
- [ ] Logs omit credentials and private content.
- [ ] Rate limits and request-size limits are enabled.
- [ ] Error responses do not expose stack traces.
- [ ] Demo data uses fictional identities.
- [ ] Public sharing and revocation are tested in production.
- [ ] Lockfile is committed.
- [ ] `.env` and secrets are not in Git.
- [ ] README explains setup, migrations, tests, and deployment.

## 4. Operational readiness

- Log errors with request IDs.
- Monitor unexpected server errors and repeated authorization failures.
- Understand database backup and restore behavior.
- Keep dependency versions and security advisories under review.
- Have a rollback plan for schema changes.
- Do not claim uptime, backups, or monitoring that the deployment does not provide.
