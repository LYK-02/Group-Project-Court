# Database Design

## 1. Principles

- PostgreSQL with UUID primary keys and `TIMESTAMPTZ`.
- Foreign keys, check constraints, and unique constraints enforce invariants.
- Use migrations; do not manually edit production schema.
- Select only needed columns; do not expose raw database rows directly.
- Choose deletion behavior deliberately so audit history is not accidentally destroyed.

## 2. Tables

### users
- `id UUID PRIMARY KEY`
- `display_name VARCHAR(60) NOT NULL`
- `email VARCHAR(254) NOT NULL UNIQUE`
- `password_hash TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Normalize email consistently before uniqueness checks.

### teams
- `id UUID PRIMARY KEY`
- `name VARCHAR(100) NOT NULL`
- `owner_id UUID NOT NULL REFERENCES users(id)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### team_members
- `team_id UUID NOT NULL REFERENCES teams(id)`
- `user_id UUID NOT NULL REFERENCES users(id)`
- `role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'member'))`
- `joined_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Primary key: `(team_id, user_id)`

Keep team owner and membership consistent using a transaction and suitable constraints.

### team_invites
- `id UUID PRIMARY KEY`
- `team_id UUID NOT NULL REFERENCES teams(id)`
- `token_hash TEXT NOT NULL UNIQUE`
- `created_by UUID NOT NULL REFERENCES users(id)`
- `expires_at TIMESTAMPTZ NOT NULL`
- `revoked_at TIMESTAMPTZ NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Generate high-entropy invite tokens. Display the raw token only when created and store only its hash.

### tasks
- `id UUID PRIMARY KEY`
- `team_id UUID NOT NULL REFERENCES teams(id)`
- `title VARCHAR(160) NOT NULL`
- `description TEXT NULL`
- `assignee_id UUID NULL REFERENCES users(id)`
- `created_by UUID NOT NULL REFERENCES users(id)`
- `status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in_progress', 'done'))`
- `due_at TIMESTAMPTZ NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

The service must verify the assignee is a member of the same team.

### cases
- `id UUID PRIMARY KEY`
- `team_id UUID NOT NULL REFERENCES teams(id)`
- `title VARCHAR(160) NOT NULL`
- `description TEXT NULL`
- `status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'open', 'closed'))`
- `created_by UUID NOT NULL REFERENCES users(id)`
- `closed_by UUID NULL REFERENCES users(id)`
- `closed_at TIMESTAMPTZ NULL`
- `verdict TEXT NULL`
- `verdict_rule_version VARCHAR(30) NULL`
- `published_at TIMESTAMPTZ NULL`
- `share_token_hash TEXT NULL UNIQUE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Never return `share_token_hash` to the client.

### evidence
- `id UUID PRIMARY KEY`
- `case_id UUID NOT NULL REFERENCES cases(id)`
- `submitted_by UUID NOT NULL REFERENCES users(id)`
- `kind VARCHAR(20) NOT NULL CHECK (kind IN ('note', 'url'))`
- `content TEXT NOT NULL`
- `visibility VARCHAR(30) NOT NULL DEFAULT 'team' CHECK (visibility IN ('team', 'private_to_submitter'))`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Allow only intended URL schemes such as HTTPS. Never fetch user-submitted URLs from the backend.

### votes
- `id UUID PRIMARY KEY`
- `case_id UUID NOT NULL REFERENCES cases(id)`
- `user_id UUID NOT NULL REFERENCES users(id)`
- `choice VARCHAR(30) NOT NULL CHECK (choice IN ('fair', 'needs_review', 'unfair'))`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Unique constraint: `(case_id, user_id)`

The unique constraint prevents concurrent duplicate votes.

### audit_events
- `id UUID PRIMARY KEY`
- `team_id UUID NOT NULL REFERENCES teams(id)`
- `actor_id UUID NULL REFERENCES users(id)`
- `action VARCHAR(80) NOT NULL`
- `entity_type VARCHAR(40) NOT NULL`
- `entity_id UUID NULL`
- `metadata JSONB NOT NULL DEFAULT '{}'::jsonb`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Never put passwords, session tokens, invite tokens, raw share tokens, or unnecessary evidence content in audit metadata.

## 3. Recommended indexes

- `team_members(user_id, team_id)`
- `tasks(team_id, status, created_at)`
- `cases(team_id, status, created_at)`
- `evidence(case_id, created_at)`
- `votes(case_id)`
- `audit_events(team_id, created_at DESC)`

Review query plans before adding indexes beyond common access patterns.

## 4. Transactions

Use transactions for:
- Team creation plus owner membership.
- Invite redemption plus membership creation.
- Case closure plus tally/verdict persistence plus audit event.
- Any multi-record action that must succeed or fail as one unit.

## 5. Migration rules

- Migrations are ordered, version-controlled, and repeatable in a fresh environment.
- Avoid destructive schema changes without a migration and backup/rollback plan.
- Seed only fictional demo data.
- Tests use an isolated database, never production.
