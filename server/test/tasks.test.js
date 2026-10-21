import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/config/db.js';
import { hashPassword } from '../src/utils/passwords.js';

describe('Tasks & Audit History API (/api/v1/teams/:teamId/tasks & audit)', () => {
  let app;
  const mockUser = {
    id: '77777777-7777-4777-8777-777777777777',
    display_name: 'Katherine Johnson',
    email: 'katherine@nasa.gov',
    password_hash: '',
    created_at: new Date().toISOString(),
  };

  const teamId = '88888888-8888-4888-8888-888888888888';
  const taskId = '99999999-9999-4999-8999-999999999999';

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

  describe('GET /api/v1/teams/:teamId/tasks', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .get(`/api/v1/teams/${teamId}/tasks`)
        .expect(401);

      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 403 when caller is not a member of the team', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [] }); // requireTeamMember

      const res = await agent
        .get(`/api/v1/teams/${teamId}/tasks`)
        .expect(403);

      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 200 with tasks list for verified team member', async () => {
      const agent = await getAuthenticatedAgent();
      const mockTasks = [
        {
          id: taskId,
          teamId,
          title: 'Calculate orbital trajectory',
          description: 'Mercury-Atlas 6 flight calculations',
          status: 'in_progress',
          dueAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignee: { id: mockUser.id, displayName: mockUser.display_name, email: mockUser.email },
          creator: { id: mockUser.id, displayName: mockUser.display_name },
        },
      ];

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'member', joined_at: new Date().toISOString() }] }) // requireTeamMember
        .mockResolvedValueOnce({ rows: mockTasks }); // getTasks query

      const res = await agent.get(`/api/v1/teams/${teamId}/tasks`).expect(200);

      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.tasks[0].title).toBe('Calculate orbital trajectory');
      expect(res.body.tasks[0].assignee.displayName).toBe('Katherine Johnson');
    });
  });

  describe('POST /api/v1/teams/:teamId/tasks', () => {
    it('rejects task creation if assignee is not a member of this team', async () => {
      const agent = await getAuthenticatedAgent();
      const nonMemberId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'member', joined_at: new Date().toISOString() }] }) // requireTeamMember
        .mockResolvedValueOnce({ rows: [] }); // assignee membership check returns empty

      const res = await agent
        .post(`/api/v1/teams/${teamId}/tasks`)
        .send({
          title: 'Unassigned rogue task',
          assigneeId: nonMemberId,
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('active member');
    });

    it('creates task and records audit event in transaction', async () => {
      const agent = await getAuthenticatedAgent();
      const mockCreatedTask = {
        id: taskId,
        teamId,
        title: 'Compute Apollo lunar insertion burn',
        description: 'Verify Saturn V trajectory telemetry',
        status: 'todo',
        dueAt: null,
        createdAt: new Date().toISOString(),
      };

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'member', joined_at: new Date().toISOString() }] }); // requireTeamMember

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [mockCreatedTask] }) // INSERT INTO tasks
          .mockResolvedValueOnce({}) // INSERT INTO audit_events
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .post(`/api/v1/teams/${teamId}/tasks`)
        .send({
          title: 'Compute Apollo lunar insertion burn',
          description: 'Verify Saturn V trajectory telemetry',
        })
        .expect(201);

      expect(res.body.task.id).toBe(taskId);
      expect(res.body.task.status).toBe('todo');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /api/v1/teams/:teamId/tasks/:taskId', () => {
    it('updates task status and attributes', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'member', joined_at: new Date().toISOString() }] }) // requireTeamMember
        .mockResolvedValueOnce({ rows: [{ id: taskId, status: 'todo', assignee_id: null, title: 'Task' }] }); // check task exists

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({
            rows: [
              {
                id: taskId,
                teamId,
                title: 'Task',
                status: 'done',
                updatedAt: new Date().toISOString(),
              },
            ],
          }) // UPDATE tasks
          .mockResolvedValueOnce({}) // INSERT INTO audit_events
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .patch(`/api/v1/teams/${teamId}/tasks/${taskId}`)
        .send({ status: 'done' })
        .expect(200);

      expect(res.body.task.status).toBe('done');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/v1/teams/:teamId/tasks/:taskId', () => {
    it('rejects task deletion when caller is neither owner nor creator', async () => {
      const agent = await getAuthenticatedAgent();
      const creatorId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'member', joined_at: new Date().toISOString() }] }) // requireTeamMember (not owner)
        .mockResolvedValueOnce({ rows: [{ id: taskId, created_by: creatorId, title: 'Someone else task' }] }); // task created by someone else

      const res = await agent
        .delete(`/api/v1/teams/${teamId}/tasks/${taskId}`)
        .expect(403);

      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('successfully deletes task when caller is team owner', async () => {
      const agent = await getAuthenticatedAgent();

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'owner', joined_at: new Date().toISOString() }] }) // requireTeamMember (role: owner)
        .mockResolvedValueOnce({ rows: [{ id: taskId, created_by: 'someone-else', title: 'Task' }] }); // task query

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({}) // DELETE FROM tasks
          .mockResolvedValueOnce({}) // INSERT INTO audit_events
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };

      vi.spyOn(db, 'getClient').mockResolvedValueOnce(mockClient);

      const res = await agent
        .delete(`/api/v1/teams/${teamId}/tasks/${taskId}`)
        .expect(200);

      expect(res.body.deleted).toBe(true);
      expect(res.body.taskId).toBe(taskId);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/v1/teams/:teamId/audit', () => {
    it('returns chronological audit records for team member', async () => {
      const agent = await getAuthenticatedAgent();
      const mockAuditEvents = [
        {
          id: 'audit-1',
          teamId,
          actorId: mockUser.id,
          actorName: mockUser.display_name,
          actorEmail: mockUser.email,
          action: 'task.created',
          entityType: 'task',
          entityId: taskId,
          metadata: { title: 'Calculate orbital trajectory' },
          createdAt: new Date().toISOString(),
        },
      ];

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockUser] }) // requireAuth
        .mockResolvedValueOnce({ rows: [{ role: 'member', joined_at: new Date().toISOString() }] }) // requireTeamMember
        .mockResolvedValueOnce({ rows: mockAuditEvents }); // audit query

      const res = await agent.get(`/api/v1/teams/${teamId}/audit`).expect(200);

      expect(res.body.events).toHaveLength(1);
      expect(res.body.events[0].action).toBe('task.created');
      expect(res.body.events[0].actorName).toBe('Katherine Johnson');
    });
  });
});
