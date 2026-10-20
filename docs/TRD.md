# Technical Requirements Document (TRD)

## 1. Technology stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | UI and fast development |
| Styling | Tailwind CSS | Design tokens and reusable styling |
| Routing | React Router | Client-side routes |
| Backend | Node.js + Express | REST API |
| Validation | Zod | Runtime request validation |
| Database | PostgreSQL | Relational integrity and transactions |
| DB access | `pg` with parameterized SQL, or one chosen ORM | Database access |
| Authentication | Server-side sessions | Revocable login sessions |
| Realtime | Socket.IO (optional) | Live updates |
| Unit/integration tests | Vitest + Supertest | Business logic and API tests |
| E2E tests | Playwright | Core browser journey |
| Version control | Git + GitHub | Review and reproducibility |

Pin compatible dependency versions and commit the lockfile.

## 2. Functional technical requirements

- Version API routes under `/api/v1`.
- Validate request params, query strings, and bodies at the API boundary.
- Use server-side authorization for every private resource.
- Use database constraints in addition to service-layer checks.
- Use transactions for multi-step writes.
- Use pagination and bounded request sizes.
- Return consistent JSON error responses.
- Keep secrets server-side.
- Keep the application a modular monolith for the MVP.

## 3. Non-functional requirements

- Responsive and keyboard-usable UI.
- Clear loading, empty, error, and success states.
- No raw stack traces or SQL errors in production responses.
- Structured logs with request IDs; no credentials or private evidence in logs.
- Database migrations can recreate the schema from a clean database.
- Core workflows can be tested in an isolated test database.
- Public sharing exposes only approved fields.
- The app must be deployable from documented instructions.

## 4. Configuration

Example variable names:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
SESSION_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```

These are placeholders. Never use the example secret in production. Do not expose secrets through frontend environment variables such as `VITE_*`.

## 5. Error format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "requestId": "request-id"
  }
}
```

Use `400` for invalid input, `401` for unauthenticated, `403` for forbidden, `404` for missing or intentionally concealed resources, `409` for conflicts, and `429` for rate limiting.

## 6. Dependency rules

- Prefer maintained, well-understood packages.
- Avoid adding dependencies without a clear need.
- Review security advisories and update deliberately.
- Use reproducible installs.
- Do not add microservices, queues, or caching until the core system needs them.
