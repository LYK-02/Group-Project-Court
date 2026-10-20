# REST API Contract

## 1. Conventions

- Prefix: `/api/v1`.
- JSON request/response bodies.
- Authenticate and authorize on the server.
- Validate route params, query strings, and request bodies.
- Use consistent error objects and bounded pagination.
- Never accept client-provided ownership, role, or final verdict fields unless explicitly intended.

## 2. Authentication

| Method | Route | Access |
|---|---|---|
| POST | `/auth/register` | Public, rate-limited |
| POST | `/auth/login` | Public, rate-limited |
| POST | `/auth/logout` | Authenticated |
| GET | `/auth/me` | Authenticated |

## 3. Teams and invites

| Method | Route | Access |
|---|---|---|
| POST | `/teams` | Authenticated |
| GET | `/teams` | Authenticated; own memberships only |
| GET | `/teams/:teamId` | Team member |
| POST | `/teams/:teamId/invites` | Owner |
| POST | `/invites/:token/join` | Authenticated |
| DELETE | `/teams/:teamId/members/:userId` | Owner, with safeguards |

## 4. Tasks

| Method | Route | Access |
|---|---|---|
| GET | `/teams/:teamId/tasks` | Team member |
| POST | `/teams/:teamId/tasks` | Team member |
| PATCH | `/teams/:teamId/tasks/:taskId` | Authorized team member |
| DELETE | `/teams/:teamId/tasks/:taskId` | Owner or creator, per policy |

## 5. Cases, evidence, votes, sharing

| Method | Route | Access |
|---|---|---|
| GET | `/teams/:teamId/cases` | Team member |
| POST | `/teams/:teamId/cases` | Team member |
| GET | `/cases/:caseId` | Team member |
| POST | `/cases/:caseId/evidence` | Team member |
| PATCH | `/evidence/:evidenceId` | Submitter or authorized owner |
| DELETE | `/evidence/:evidenceId` | Submitter or authorized owner |
| PUT | `/cases/:caseId/vote` | Eligible team member |
| POST | `/cases/:caseId/close` | Owner or case creator, per policy |
| POST | `/cases/:caseId/share` | Authorized team member |
| DELETE | `/cases/:caseId/share` | Authorized team member |
| GET | `/public/cases/:token` | Public; sanitized fields only |

## 6. Status codes

- `200 OK`: successful read/update.
- `201 Created`: resource created.
- `204 No Content`: successful delete where appropriate.
- `400 Bad Request`: malformed or invalid input.
- `401 Unauthorized`: no valid authentication.
- `403 Forbidden`: authenticated but not allowed.
- `404 Not Found`: missing or intentionally concealed resource.
- `409 Conflict`: duplicate or incompatible state.
- `429 Too Many Requests`: rate limit exceeded.
- `500 Internal Server Error`: unexpected failure with generic client message.

## 7. Error shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "requestId": "request-id"
  }
}
```

Do not send stack traces, SQL errors, secret values, or infrastructure details.

## 8. Request rules

- Validate UUIDs and enum values.
- Bound string length and request-body size.
- Paginate lists and cap page size.
- Load trusted ownership and role information from the server/database.
- Use parameterized SQL.
- For voting, enforce the unique `(case_id, user_id)` database constraint.
- For case closure, use a transaction and concurrency-safe locking.
- For public sharing, use a dedicated response DTO with allowlisted fields.
- Socket.IO events, if added, must follow equivalent authorization rules.
