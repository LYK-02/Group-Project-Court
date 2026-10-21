import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/config/db.js';
import { hashPassword } from '../src/utils/passwords.js';

describe('Authentication API (/api/v1/auth)', () => {
  let app;

  beforeEach(() => {
    vi.restoreAllMocks();
    app = createApp();
  });

  describe('POST /api/v1/auth/register', () => {
    it('creates a new user and sets session cookie for valid credentials', async () => {
      const mockCreatedUser = {
        id: '11111111-1111-4111-8111-111111111111',
        display_name: 'Ada Lovelace',
        email: 'ada@example.edu',
        created_at: new Date().toISOString(),
      };

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [] }) // duplicate email check
        .mockResolvedValueOnce({ rows: [mockCreatedUser] }); // insert query

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          displayName: 'Ada Lovelace',
          email: 'ada@example.edu',
          password: 'SecurePassword123!',
        })
        .expect(201);

      expect(res.body.user).toEqual({
        id: mockCreatedUser.id,
        displayName: mockCreatedUser.display_name,
        email: mockCreatedUser.email,
        createdAt: mockCreatedUser.created_at,
      });

      // Session cookie must be set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.startsWith('gpc.sid='))).toBe(true);
    });

    it('rejects registration when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          displayName: 'Invalid User',
          email: 'not-an-email',
          password: 'SecurePassword123!',
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects registration when password is shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          displayName: 'Short Password',
          email: 'short@example.edu',
          password: '123',
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 409 Conflict when user email is already registered', async () => {
      vi.spyOn(db, 'query').mockResolvedValueOnce({
        rows: [{ id: 'existing-uuid-123' }],
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          displayName: 'Duplicate User',
          email: 'exists@example.edu',
          password: 'SecurePassword123!',
        })
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('authenticates user with valid credentials and sets session cookie', async () => {
      const rawPassword = 'ValidPassword123!';
      const passwordHash = await hashPassword(rawPassword);
      const mockUser = {
        id: '22222222-2222-4222-8222-222222222222',
        display_name: 'Grace Hopper',
        email: 'grace@example.edu',
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
      };

      vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [mockUser] });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'grace@example.edu',
          password: rawPassword,
        })
        .expect(200);

      expect(res.body.user).toEqual({
        id: mockUser.id,
        displayName: mockUser.display_name,
        email: mockUser.email,
        createdAt: mockUser.created_at,
      });

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.startsWith('gpc.sid='))).toBe(true);
    });

    it('returns 401 with uniform message when email does not exist', async () => {
      vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'unknown@example.edu',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Invalid email or password.');
    });

    it('returns 401 with uniform message when password does not match', async () => {
      const passwordHash = await hashPassword('CorrectPassword123!');
      vi.spyOn(db, 'query').mockResolvedValueOnce({
        rows: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            display_name: 'Grace Hopper',
            email: 'grace@example.edu',
            password_hash: passwordHash,
            created_at: new Date().toISOString(),
          },
        ],
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'grace@example.edu',
          password: 'WrongPassword!',
        })
        .expect(401);

      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Invalid email or password.');
    });
  });

  describe('GET /api/v1/auth/me & POST /api/v1/auth/logout', () => {
    it('returns 401 Unauthorized when accessing /auth/me without an active session', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('authenticates session and successfully logs out', async () => {
      const rawPassword = 'SessionPassword123!';
      const passwordHash = await hashPassword(rawPassword);
      const mockUser = {
        id: '33333333-3333-4333-8333-333333333333',
        display_name: 'Alan Turing',
        email: 'alan@example.edu',
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
      };

      // 1. Login to establish session
      vi.spyOn(db, 'query').mockResolvedValueOnce({ rows: [mockUser] });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alan@example.edu',
          password: rawPassword,
        })
        .expect(200);

      const cookie = loginRes.headers['set-cookie'];

      // 2. Access /auth/me with session cookie
      // requireAuth queries user, authController.me queries user
      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockUser.id,
              display_name: mockUser.display_name,
              email: mockUser.email,
              created_at: mockUser.created_at,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockUser.id,
              display_name: mockUser.display_name,
              email: mockUser.email,
              created_at: mockUser.created_at,
            },
          ],
        });

      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(meRes.body.user.email).toBe('alan@example.edu');

      // 3. Logout
      vi.spyOn(db, 'query').mockResolvedValueOnce({
        rows: [
          {
            id: mockUser.id,
            display_name: mockUser.display_name,
            email: mockUser.email,
            created_at: mockUser.created_at,
          },
        ],
      });

      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', cookie)
        .expect(200);

      expect(logoutRes.body.message).toBe('Successfully logged out.');
    });
  });
});
