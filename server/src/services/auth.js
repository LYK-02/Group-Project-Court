import { db } from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/passwords.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';

export const authService = {
  /**
   * Register a new user with bcrypt-hashed credentials
   */
  async register({ displayName, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if email is already taken
    const { rows: existing } = await db.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1;',
      [normalizedEmail]
    );

    if (existing.length > 0) {
      throw new ConflictError('An account with this email address already exists.');
    }

    // 2. Hash password securely
    const passwordHash = await hashPassword(password);

    // 3. Persist new user
    const { rows: created } = await db.query(
      `INSERT INTO users (display_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, display_name, email, created_at;`,
      [displayName.trim(), normalizedEmail, passwordHash]
    );

    const user = created[0];
    return {
      id: user.id,
      displayName: user.display_name,
      email: user.email,
      createdAt: user.created_at,
    };
  },

  /**
   * Authenticate user credentials without revealing user existence on failure
   */
  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Query candidate by email
    const { rows } = await db.query(
      'SELECT id, display_name, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1;',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      // Intentionally uniform error message to prevent user enumeration
      throw new UnauthorizedError('Invalid email or password.');
    }

    const candidate = rows[0];

    // 2. Verify password hash
    const isValid = await verifyPassword(password, candidate.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    return {
      id: candidate.id,
      displayName: candidate.display_name,
      email: candidate.email,
      createdAt: candidate.created_at,
    };
  },

  /**
   * Retrieve sanitized user profile by UUID
   */
  async getCurrentUser(userId) {
    const { rows } = await db.query(
      'SELECT id, display_name, email, created_at FROM users WHERE id = $1 LIMIT 1;',
      [userId]
    );

    if (rows.length === 0) {
      throw new NotFoundError('User profile not found.');
    }

    const user = rows[0];
    return {
      id: user.id,
      displayName: user.display_name,
      email: user.email,
      createdAt: user.created_at,
    };
  },
};
