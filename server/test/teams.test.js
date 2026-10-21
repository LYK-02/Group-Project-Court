import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/config/db.js';
import { hashPassword } from '../src/utils/passwords.js';

describe('Teams and Invites API (/api/v1/teams & /api/v1/invites)', () => {
  let app;
  const mockUser = {
    id: '44444444-4444-4444-8444-444444444444',
    display_name: 'Margaret Hamilton',
    email: 'margaret@apollo.edu',
    password_hash: '',
    created_at: new Date().toISOString(),
  };

  async function getAuthenticatedAgent() {
    const rawPassword = 'Password123!';
    const passwordHash = await hashPassword(rawPassword);
    mockUser.password_hash = passwordHash;

    const agent = request.agent(app);

    vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [mockUser] });

    await agent
      .post('/api/v1/auth/login')
      .send({ email: mockUser.email, password: rawPassword })
      .expect(200);

    return agent;
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    app = createApp();
  });

  describe('POST /api/v1/teams', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .send({ name: 'Apollo Team' })
        .expect(401);

      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects team creation when name is too short', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [mockUser] }); // requireAuth

      const res = await agent
        .post('/api/v1/teams')
        .send({ name: 'A' })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('creates team and returns 201 with owner membership', async () => {
      const agent = await getAuthenticatedAgent();
      const mockTeam = {
        id: '55555555-5555-4555-8555-555555555555',
        name: 'Apollo Guidance Software',
        owner_id: mockUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [mockUser] }); // requireAuth

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [mockTeam] }) // INSERT INTO teams
          .mockResolvedValueOnce({}) // INSERT INTO team_members
          .mockResolvedValueOnce({}) // INSERT INTO audit_events
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .post('/api/v1/teams')
        .send({ name: 'Apollo Guidance Software' })
        .expect(201);

      expect(res.body.team).toMatchObject({
        id: mockTeam.id,
        name: mockTeam.name,
        ownerId: mockUser.id,
        role: 'owner',
      });
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/v1/teams', () => {
    it('returns 200 with list of teams user belongs to', async () => {
      const agent = await getAuthenticatedAgent();
      const mockTeams = [
        {
          id: '55555555-5555-4555-8555-555555555555',
          name: 'Apollo Guidance Software',
          ownerId: mockUser.id,
          role: 'owner',
          createdAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
          memberCount: 3,
        },
      ];

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: mockTeams }); // getUserTeams

      const res = await agent.get('/api/v1/teams').expect(200);

      expect(res.body.teams).toHaveLength(1);
      expect(res.body.teams[0].name).toBe('Apollo Guidance Software');
    });
  });

  describe('GET /api/v1/teams/:teamId', () => {
    const validTeamId = '55555555-5555-4555-8555-555555555555';

    it('returns 400 for malformed teamId UUID', async () => {
      const agent = await getAuthenticatedAgent();
      vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [mockUser] }); // requireAuth

      const res = await agent.get('/api/v1/teams/not-a-valid-uuid').expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 403 Forbidden when user is not a member of the requested team', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [] }); // requireTeamMember lookup empty

      const res = await agent.get(`/api/v1/teams/${validTeamId}`).expect(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 200 with team details and member roster when user is a member', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'member', joined_at: new Date().toISOString() }] }) // requireTeamMember
        .mockResolvedValueOnce({
          rows: [
            {
              id: validTeamId,
              name: 'Apollo Guidance Software',
              ownerId: 'other-owner-uuid',
              createdAt: new Date().toISOString(),
            },
          ],
        }) // team query
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockUser.id,
              displayName: mockUser.display_name,
              email: mockUser.email,
              role: 'member',
              joinedAt: new Date().toISOString(),
            },
          ],
        }); // members query

      const res = await agent.get(`/api/v1/teams/${validTeamId}`).expect(200);

      expect(res.body.team.id).toBe(validTeamId);
      expect(res.body.team.members).toHaveLength(1);
      expect(res.body.team.members[0].displayName).toBe('Margaret Hamilton');
    });
  });

  describe('POST /api/v1/teams/:teamId/invites', () => {
    const validTeamId = '55555555-5555-4555-8555-555555555555';

    it('returns 403 Forbidden when caller is only a member and not the owner', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'member', joined_at: new Date().toISOString() }] }); // requireTeamMember (not owner)

      const res = await agent
        .post(`/api/v1/teams/${validTeamId}/invites`)
        .send({ expiresInHours: 48 })
        .expect(403);

      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Only the team owner');
    });

    it('generates an invite code when caller is team owner', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'owner', joined_at: new Date().toISOString() }] }); // requireTeamOwner

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: 'invite-uuid-123', expires_at: new Date().toISOString() }],
          }) // INSERT INTO team_invites
          .mockResolvedValueOnce({}) // INSERT INTO audit_events
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .post(`/api/v1/teams/${validTeamId}/invites`)
        .send({ expiresInHours: 72 })
        .expect(201);

      expect(res.body.invite).toBeDefined();
      expect(typeof res.body.invite.code).toBe('string');
      expect(res.body.invite.code.length).toBeGreaterThan(30);
      expect(res.body.invite.teamId).toBe(validTeamId);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/invites/:token/join', () => {
    it('returns 404 when invite code does not exist', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [] }); // locate invite query

      const res = await agent
        .post('/api/v1/invites/non-existent-token/join')
        .expect(404);

      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toBe('Invalid invitation code.');
    });

    it('returns 409 Conflict when invite has been revoked', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'invite-1',
              team_id: '55555555-5555-4555-8555-555555555555',
              expires_at: new Date(Date.now() + 100000).toISOString(),
              revoked_at: new Date().toISOString(),
            },
          ],
        });

      const res = await agent
        .post('/api/v1/invites/some-token/join')
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('revoked');
    });

    it('returns 409 Conflict when user is already a member', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'invite-1',
              team_id: '55555555-5555-4555-8555-555555555555',
              expires_at: new Date(Date.now() + 100000).toISOString(),
              revoked_at: null,
            },
          ],
        }) // locate invite
        .mockResolvedValueOnce({
          rows: [{ role: 'member' }],
        }); // duplicate check

      const res = await agent
        .post('/api/v1/invites/some-token/join')
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('already a member');
    });

    it('successfully joins team and returns 200 on valid invite', async () => {
      const agent = await getAuthenticatedAgent();
      const teamId = '55555555-5555-4555-8555-555555555555';

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'invite-1',
              team_id: teamId,
              expires_at: new Date(Date.now() + 100000).toISOString(),
              revoked_at: null,
            },
          ],
        }) // locate invite
        .mockResolvedValueOnce({ rows: [] }); // duplicate check

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // 1. BEGIN
          .mockResolvedValueOnce({}) // 2. INSERT INTO team_members
          .mockResolvedValueOnce({}) // 3. INSERT INTO audit_events
          .mockResolvedValueOnce({
            rows: [{ id: teamId, name: 'Apollo Guidance Software' }],
          }) // 4. SELECT team summary
          .mockResolvedValueOnce({}), // 5. COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .post('/api/v1/invites/valid-token-12345/join')
        .expect(200);

      expect(res.body.role).toBe('member');
      expect(res.body.team.name).toBe('Apollo Guidance Software');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/v1/teams/:teamId/members/:userId', () => {
    const teamId = '55555555-5555-4555-8555-555555555555';
    const targetUserId = '66666666-6666-4666-8666-666666666666';

    it('rejects removing the team owner with 403 Forbidden', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'owner', joined_at: new Date().toISOString() }] }) // requireTeamOwner
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] }); // target user role is owner

      const res = await agent
        .delete(`/api/v1/teams/${teamId}/members/${targetUserId}`)
        .expect(403);

      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Team owner cannot be removed');
    });

    it('successfully removes regular member when called by owner', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'owner', joined_at: new Date().toISOString() }] }) // requireTeamOwner
        .mockResolvedValueOnce({ rows: [{ role: 'member' }] }) // target user role
        .mockResolvedValueOnce({ rowCount: 1 }) // DELETE FROM team_members
        .mockResolvedValueOnce({ rowCount: 1 }); // INSERT INTO audit_events

      const res = await agent
        .delete(`/api/v1/teams/${teamId}/members/${targetUserId}`)
        .expect(200);

      expect(res.body.removed).toBe(true);
      expect(res.body.userId).toBe(targetUserId);
    });
  });
});
