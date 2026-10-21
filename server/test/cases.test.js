import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/config/db.js';
import { hashPassword } from '../src/utils/passwords.js';

describe('Cases, Evidence, Voting & Verdicts API (/api/v1/teams/:teamId/cases & /public/cases)', () => {
  let app;
  const mockUser = {
    id: '11111111-1111-4111-8111-111111111111',
    display_name: 'Grace Hopper',
    email: 'grace@navy.mil',
    password_hash: '',
    created_at: new Date().toISOString(),
  };

  const teamId = '22222222-2222-4222-8222-222222222222';
  const caseId = '33333333-3333-4333-8333-333333333333';

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

  describe('GET /api/v1/teams/:teamId/cases', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .get(`/api/v1/teams/${teamId}/cases`)
        .expect(401);

      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 403 when user is not a team member', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [] }); // requireTeamMember

      const res = await agent
        .get(`/api/v1/teams/${teamId}/cases`)
        .expect(403);

      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 200 with list of team cases and vote stats', async () => {
      const agent = await getAuthenticatedAgent();
      const mockCases = [
        {
          id: caseId,
          teamId,
          title: 'The Unfinished Backend Service Module',
          description: 'PR left abandoned 2 hours before submission deadline.',
          status: 'open',
          createdAt: new Date().toISOString(),
          closedAt: null,
          verdict: null,
          creator: { id: mockUser.id, displayName: mockUser.display_name },
          voteStats: { fair: 1, needsReview: 2, unfair: 3, total: 6 },
        },
      ];

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'member' }] }) // requireTeamMember
        .mockResolvedValueOnce({ rows: mockCases }); // getTeamCases query

      const res = await agent.get(`/api/v1/teams/${teamId}/cases`).expect(200);

      expect(res.body.cases).toHaveLength(1);
      expect(res.body.cases[0].title).toBe('The Unfinished Backend Service Module');
      expect(res.body.cases[0].voteStats.total).toBe(6);
    });
  });

  describe('POST /api/v1/teams/:teamId/cases', () => {
    it('rejects case creation with missing title', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [{ role: 'member' }] });

      const res = await agent
        .post(`/api/v1/teams/${teamId}/cases`)
        .send({ description: 'Missing title' })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('creates dispute case and creates audit trail in transaction', async () => {
      const agent = await getAuthenticatedAgent();
      const mockCreatedCase = {
        id: caseId,
        teamId,
        title: 'Missing Database Index',
        description: 'Queries are timing out in production test environment.',
        status: 'open',
        createdAt: new Date().toISOString(),
      };

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [{ role: 'member' }] });

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [mockCreatedCase] }) // INSERT INTO cases
          .mockResolvedValueOnce({}) // INSERT INTO audit_events
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .post(`/api/v1/teams/${teamId}/cases`)
        .send({
          title: 'Missing Database Index',
          description: 'Queries are timing out in production test environment.',
        })
        .expect(201);

      expect(res.body.case.id).toBe(caseId);
      expect(res.body.case.title).toBe('Missing Database Index');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/v1/teams/:teamId/cases/:caseId', () => {
    it('returns single case details with evidence, voteStats, and userVote', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [{ role: 'member' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: caseId,
              teamId,
              title: 'Skipped Code Reviews',
              description: 'Direct push to main branch with broken tests.',
              status: 'open',
              verdict: null,
              verdictRuleVersion: null,
              createdAt: new Date().toISOString(),
              closedAt: null,
              publishedAt: null,
              isShared: false,
              creator: { id: mockUser.id, displayName: mockUser.display_name },
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: '44444444-4444-4444-8444-444444444444',
              caseId,
              kind: 'url',
              content: 'https://github.com/org/repo/commit/123456',
              visibility: 'team',
              createdAt: new Date().toISOString(),
              submitter: { id: mockUser.id, displayName: mockUser.display_name },
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ fair: 0, needsReview: 1, unfair: 2, total: 3 }],
        })
        .mockResolvedValueOnce({
          rows: [{ choice: 'unfair' }],
        });

      const res = await agent.get(`/api/v1/teams/${teamId}/cases/${caseId}`).expect(200);

      expect(res.body.case.id).toBe(caseId);
      expect(res.body.case.evidence).toHaveLength(1);
      expect(res.body.case.voteStats.total).toBe(3);
      expect(res.body.case.userVote).toBe('unfair');
    });
  });

  describe('POST /api/v1/teams/:teamId/cases/:caseId/evidence', () => {
    it('rejects evidence submission if case is closed', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [{ role: 'member' }] })
        .mockResolvedValueOnce({ rows: [{ id: caseId, status: 'closed' }] });

      const res = await agent
        .post(`/api/v1/teams/${teamId}/cases/${caseId}/evidence`)
        .send({ kind: 'note', content: 'Belated testimony after verdict.' })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('submits evidence successfully and records audit event in transaction', async () => {
      const agent = await getAuthenticatedAgent();
      const mockEvidence = {
        id: '55555555-5555-4555-8555-555555555555',
        caseId,
        kind: 'note',
        content: 'Witnessed the late pull request submission at 11:59pm.',
        visibility: 'team',
        createdAt: new Date().toISOString(),
      };

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [{ role: 'member' }] })
        .mockResolvedValueOnce({ rows: [{ id: caseId, status: 'open' }] });

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [mockEvidence] }) // INSERT INTO evidence
          .mockResolvedValueOnce({}) // INSERT INTO audit_events
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .post(`/api/v1/teams/${teamId}/cases/${caseId}/evidence`)
        .send({
          kind: 'note',
          content: 'Witnessed the late pull request submission at 11:59pm.',
          visibility: 'team',
        })
        .expect(201);

      expect(res.body.evidence.id).toBe(mockEvidence.id);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/teams/:teamId/cases/:caseId/votes', () => {
    it('records juror vote via upsert', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [{ role: 'member' }] })
        .mockResolvedValueOnce({ rows: [{ id: caseId, status: 'open' }] });

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'vote-id-1', choice: 'unfair' }] }) // UPSERT INTO votes
          .mockResolvedValueOnce({}) // INSERT INTO audit_events
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .post(`/api/v1/teams/${teamId}/cases/${caseId}/votes`)
        .send({ choice: 'unfair' })
        .expect(200);

      expect(res.body.voted).toBe(true);
      expect(res.body.choice).toBe('unfair');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/teams/:teamId/cases/:caseId/close', () => {
    it('calculates satirical verdict and delivers closed case', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [{ role: 'owner' }] });

      const mockClosedResult = {
        id: caseId,
        status: 'closed',
        verdict: 'GUILTY AS CHARGED: By a jury majority (4 unfair votes of 5), the bench finds extreme contribution deficit.',
        verdictRuleVersion: 'v1.0-strict-consensus',
        closedAt: new Date().toISOString(),
      };

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: caseId, title: 'Case', status: 'open', created_by: mockUser.id }],
          }) // SELECT FOR UPDATE
          .mockResolvedValueOnce({
            rows: [{ fair: 1, needsReview: 0, unfair: 4, total: 5 }],
          }) // SELECT tallies
          .mockResolvedValueOnce({ rows: [mockClosedResult] }) // UPDATE cases
          .mockResolvedValueOnce({}) // INSERT INTO audit_events
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .post(`/api/v1/teams/${teamId}/cases/${caseId}/close`)
        .expect(200);

      expect(res.body.case.status).toBe('closed');
      expect(res.body.case.verdict).toContain('GUILTY AS CHARGED');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('Case Public Sharing and Public Dossier API', () => {
    it('generates a public share token and logs audit event', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [{ role: 'member' }] })
        .mockResolvedValueOnce({ rows: [{ id: caseId, publishedAt: new Date().toISOString() }] }) // UPDATE cases
        .mockResolvedValueOnce({}); // INSERT audit_events

      const res = await agent
        .post(`/api/v1/teams/${teamId}/cases/${caseId}/share`)
        .expect(200);

      expect(res.body.shared).toBe(true);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThanOrEqual(32);
    });

    it('returns sanitized public case dossier without auth', async () => {
      const mockRawToken = 'a'.repeat(32);

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({
          rows: [
            {
              id: caseId,
              title: 'The Great Group Project Ghosting',
              description: 'Teammate vanished 3 days before demo.',
              status: 'closed',
              verdict: 'GUILTY AS CHARGED',
              verdictRuleVersion: 'v1.0-strict-consensus',
              publishedAt: new Date().toISOString(),
              closedAt: new Date().toISOString(),
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              kind: 'url',
              content: 'https://github.com/project/commits',
              createdAt: new Date().toISOString(),
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ fair: 0, needsReview: 0, unfair: 5, total: 5 }],
        });

      const res = await request(app)
        .get(`/api/v1/public/cases/${mockRawToken}`)
        .expect(200);

      expect(res.body.case.title).toBe('The Great Group Project Ghosting');
      expect(res.body.case.verdict).toBe('GUILTY AS CHARGED');
      expect(res.body.case.evidence).toHaveLength(1);
      // Ensure no internal token or user email was leaked in public readout
      expect(res.body.case.shareTokenHash).toBeUndefined();
      expect(res.body.case.creator).toBeUndefined();
    });
  });
});
