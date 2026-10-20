# Security Requirements and Threat Checklist

## 1. Security posture

The app stores account credentials, team activity, evidence notes, votes, and share settings. The primary risks are unauthorized resource access, token leakage, injection, cross-site scripting, abuse, and accidental publication of private information.

## 2. Authentication and sessions

- Hash passwords with a suitable password-hashing algorithm such as Argon2id or bcrypt using an appropriate work factor.
- Never store plaintext passwords or log credentials.
- Prefer server-side sessions with high-entropy session IDs in secure, HTTP-only cookies.
- In production, configure `Secure`, `HttpOnly`, and an appropriate `SameSite` policy.
- Rotate session IDs after login and privilege changes.
- Invalidate sessions on logout and support revocation.
- Protect cookie-authenticated state-changing requests against CSRF.
- Rate-limit login, registration, invite redemption, and other abuse-prone endpoints.
- Avoid authentication errors that disclose whether an email exists.

## 3. Authorization and IDOR

- Check permissions on every private-resource request.
- Never rely on hiding UI buttons.
- Verify team membership before reading or mutating team tasks, cases, evidence, votes, or audit events.
- Verify task assignees belong to the same team.
- Verify voters belong to the case's team.
- Apply authorization to Socket.IO rooms and events.
- Test cross-user and cross-team access attempts.
- Use consistent error behavior to avoid leaking resource existence.

## 4. Validation and injection

- Validate all request params, query strings, and bodies with a runtime schema.
- Use parameterized SQL; never concatenate untrusted input into SQL.
- Allowlist status and vote enums.
- Limit string length, JSON body size, and pagination.
- Render user content as text by default.
- Avoid unsafe HTML injection. Sanitize any explicitly supported Markdown/HTML.
- Allow only intended URL schemes, such as HTTPS.
- Never fetch arbitrary submitted URLs server-side.
- If uploads are added, limit size/type, rename files, and store outside executable paths.

## 5. Public sharing and privacy

- Sharing is opt-in.
- Generate high-entropy random share tokens with a cryptographically secure generator.
- Store a token hash rather than the raw token.
- Public endpoints return allowlisted fields only.
- Never expose private evidence, email addresses, invite codes, session data, raw tokens, or audit metadata.
- Support revocation and, if implemented, expiry.
- Use `Cache-Control: no-store` for sensitive views where appropriate.
- Explain that published content can be copied by viewers.
- Encourage fictional identities and prohibit doxxing, threats, and non-consensual sensitive disclosures.

## 6. Browser and transport security

- Use HTTPS in production.
- Restrict CORS to the intended frontend origin.
- Never combine wildcard CORS with credentialed requests.
- Apply CSRF defenses for cookie-authenticated writes.
- Use secure headers and a suitable Content Security Policy where feasible.
- Do not store session tokens in `localStorage`.
- Avoid `dangerouslySetInnerHTML`.
- Do not expose backend secrets through `VITE_*` variables.

## 7. Rate limits and availability

Rate-limit:
- Login and registration.
- Invite creation and redemption.
- Case creation and evidence submission.
- Voting and share-link generation.
- Search and large list endpoints.

Also enforce request-size limits, bounded pagination, safe query limits, and database timeouts where supported.

## 8. Secrets and dependencies

- Store secrets in environment variables or a hosting secret manager.
- Commit `.env.example` with placeholders only.
- Rotate secrets if exposed.
- Use least-privilege database credentials.
- Commit lockfiles and use reproducible installs.
- Review dependency security advisories.
- Run migrations through a controlled process.
- Understand available backup and restore options.

## 9. Logging and audit

- Use structured logs and request IDs.
- Log significant membership, sharing, case closure, and authorization events.
- Never log passwords, cookies, session IDs, invite tokens, raw share tokens, or unnecessary evidence content.
- Keep audit events separate from operational logs.
- Do not claim audit records are tamper-proof unless the system actually guarantees it.

## 10. Pre-demo checklist

- [ ] Private routes require authentication.
- [ ] Non-members cannot read or modify another team's data.
- [ ] Task assignees must belong to the team.
- [ ] Duplicate votes fail, including concurrent attempts.
- [ ] Closed cases reject votes.
- [ ] Invalid, expired, and revoked invites fail.
- [ ] Revoked share links fail.
- [ ] Public responses contain approved fields only.
- [ ] Invalid UUIDs and enum values are rejected.
- [ ] SQL-like input is treated as data.
- [ ] Script payloads render safely as text.
- [ ] Sensitive routes are rate-limited.
- [ ] Logs and browser bundles contain no secrets.
