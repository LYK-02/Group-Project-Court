-- Seed: 001_demo_seed.sql
-- Fictional student-team dataset for local development and demonstration.
-- All identities and scenarios are purely satirical and fictitious.

DO $$
DECLARE
    v_alex_id UUID := '11111111-1111-1111-1111-111111111111';
    v_jordan_id UUID := '22222222-2222-2222-2222-222222222222';
    v_taylor_id UUID := '33333333-3333-3333-3333-333333333333';
    v_team_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    v_case_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    -- Precomputed bcrypt hash of 'Password123!' (cost 10)
    v_hash TEXT := '$2b$10$95XvN6zR70tLp1y4r52z3.kXzV1L3yF79fG3gH9a6P1L3K7D4Z1W.';
BEGIN
    -- 1. Insert Fictional Users
    INSERT INTO users (id, display_name, email, password_hash, created_at, updated_at)
    VALUES
        (v_alex_id, 'Alex Rivera (The Carry)', 'alex@demo.court', v_hash, now(), now()),
        (v_jordan_id, 'Jordan Lee (The Ghost)', 'jordan@demo.court', v_hash, now(), now()),
        (v_taylor_id, 'Taylor Kim (The Scribe)', 'taylor@demo.court', v_hash, now(), now())
    ON CONFLICT (email) DO NOTHING;

    -- 2. Insert Demo Team
    INSERT INTO teams (id, name, owner_id, created_at, updated_at)
    VALUES
        (v_team_id, 'CS 401: Distributed Consensus Calamity', v_alex_id, now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Team Memberships
    INSERT INTO team_members (team_id, user_id, role, joined_at)
    VALUES
        (v_team_id, v_alex_id, 'owner', now()),
        (v_team_id, v_jordan_id, 'member', now()),
        (v_team_id, v_taylor_id, 'member', now())
    ON CONFLICT (team_id, user_id) DO NOTHING;

    -- 4. Insert Demo Tasks
    INSERT INTO tasks (team_id, title, description, assignee_id, created_by, status, created_at, updated_at)
    VALUES
        (v_team_id, 'Implement Raft state machine and consensus leader election', 'Keep server replicas in sync under network partition.', v_alex_id, v_alex_id, 'done', now(), now()),
        (v_team_id, 'Draft complete system architecture and benchmark charts', 'Prepare final slide deck for presentation day.', v_taylor_id, v_alex_id, 'in_progress', now(), now()),
        (v_team_id, 'Write integration test suite for load balancer failover', 'Promised three weeks ago; currently unstarted.', v_jordan_id, v_alex_id, 'todo', now(), now())
    ON CONFLICT DO NOTHING;

    -- 5. Insert Demo Case
    INSERT INTO cases (id, team_id, title, description, status, created_by, created_at, updated_at)
    VALUES
        (v_case_id, v_team_id, 'The Mystery of the Missing Load-Balancer Tests', 'Defendant allegedly cited supernatural ISP interference while Discord activity showed 40 hours in an MMO.', 'open', v_alex_id, now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Evidence
    INSERT INTO evidence (case_id, submitted_by, kind, content, visibility, created_at, updated_at)
    VALUES
        (v_case_id, v_alex_id, 'note', 'Repository commit history shows 0 commits from Jordan over the entire sprint.', 'team', now(), now()),
        (v_case_id, v_taylor_id, 'note', 'Meeting minutes show Jordan joined Discord voice channel, said "mic broken", and muted for 2 hours.', 'team', now(), now())
    ON CONFLICT DO NOTHING;

    -- 7. Insert Initial Votes
    INSERT INTO votes (case_id, user_id, choice, created_at, updated_at)
    VALUES
        (v_case_id, v_alex_id, 'unfair', now(), now()),
        (v_case_id, v_taylor_id, 'unfair', now(), now())
    ON CONFLICT (case_id, user_id) DO NOTHING;

    -- 8. Insert Audit Trail
    INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata, created_at)
    VALUES
        (v_team_id, v_alex_id, 'team.created', 'team', v_team_id, '{"name": "CS 401: Distributed Consensus Calamity"}'::jsonb, now()),
        (v_team_id, v_alex_id, 'case.opened', 'case', v_case_id, '{"title": "The Mystery of the Missing Load-Balancer Tests"}'::jsonb, now())
    ON CONFLICT DO NOTHING;
END $$;
