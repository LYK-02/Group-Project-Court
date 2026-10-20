import session from 'express-session';
import { env } from '../config/env.js';
import { db } from '../config/db.js';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors.js';

/**
 * Configure secure, HTTP-only session cookie middleware
 */
export const sessionMiddleware = session({
  name: 'gpc.sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

/**
 * Authenticates active session and populates req.user
 */
export async function requireAuth(req, res, next) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new UnauthorizedError('Authentication required. Please log in.');
    }

    const { rows } = await db.query(
      'SELECT id, display_name, email, created_at FROM users WHERE id = $1 LIMIT 1;',
      [userId]
    );

    if (rows.length === 0) {
      req.session.destroy(() => {});
      throw new UnauthorizedError('Session invalid or account no longer exists.');
    }

    const u = rows[0];
    req.user = {
      id: u.id,
      displayName: u.display_name,
      email: u.email,
      createdAt: u.created_at,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Verifies authenticated user is a verified member of the requested team
 */
export async function requireTeamMember(req, res, next) {
  try {
    const teamId = req.params.teamId;
    if (!teamId) {
      throw new NotFoundError('Team ID is required.');
    }

    const userId = req.user.id;
    const { rows } = await db.query(
      'SELECT role, joined_at FROM team_members WHERE team_id = $1 AND user_id = $2 LIMIT 1;',
      [teamId, userId]
    );

    if (rows.length === 0) {
      throw new ForbiddenError('You do not belong to this team.');
    }

    req.membership = {
      teamId,
      userId,
      role: rows[0].role,
      joinedAt: rows[0].joined_at,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Verifies authenticated user is the designated owner of the requested team
 */
export async function requireTeamOwner(req, res, next) {
  // First ensure team membership is evaluated
  requireTeamMember(req, res, (err) => {
    if (err) return next(err);

    if (req.membership.role !== 'owner') {
      return next(new ForbiddenError('Only the team owner can perform this operation.'));
    }

    next();
  });
}
