import { db } from '../config/db.js';
import { generateRandomToken, hashToken } from '../utils/tokens.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';

export const teamService = {
  /**
   * Create team, assign owner membership, and log audit record in a single transaction
   */
  async createTeam({ name, userId }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // 1. Insert team
      const { rows: teamRows } = await client.query(
        `INSERT INTO teams (name, owner_id)
         VALUES ($1, $2)
         RETURNING id, name, owner_id, created_at, updated_at;`,
        [name.trim(), userId]
      );
      const team = teamRows[0];

      // 2. Insert owner membership
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, 'owner');`,
        [team.id, userId]
      );

      // 3. Log audit event
      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'team.created', 'team', $3, $4);`,
        [team.id, userId, team.id, JSON.stringify({ name: team.name })]
      );

      await client.query('COMMIT');

      return {
        id: team.id,
        name: team.name,
        ownerId: team.owner_id,
        role: 'owner',
        createdAt: team.created_at,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Retrieve all teams current user belongs to
   */
  async getUserTeams(userId) {
    const query = `
      SELECT
        t.id,
        t.name,
        t.owner_id AS "ownerId",
        t.created_at AS "createdAt",
        tm.role,
        tm.joined_at AS "joinedAt",
        (SELECT COUNT(*)::int FROM team_members WHERE team_id = t.id) AS "memberCount"
      FROM teams t
      INNER JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = $1
      ORDER BY t.created_at DESC;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  },

  /**
   * Get team details and member list for authorized members
   */
  async getTeamById(teamId) {
    const teamRes = await db.query(
      `SELECT id, name, owner_id AS "ownerId", created_at AS "createdAt"
       FROM teams
       WHERE id = $1 LIMIT 1;`,
      [teamId]
    );

    if (teamRes.rows.length === 0) {
      throw new NotFoundError('Team not found.');
    }

    const membersRes = await db.query(
      `SELECT
         u.id,
         u.display_name AS "displayName",
         u.email,
         tm.role,
         tm.joined_at AS "joinedAt"
       FROM team_members tm
       INNER JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = $1
       ORDER BY tm.role DESC, tm.joined_at ASC;`,
      [teamId]
    );

    const team = teamRes.rows[0];
    return {
      ...team,
      members: membersRes.rows,
    };
  },

  /**
   * Generate a secure random invite code valid for a configurable window
   */
  async createInvite({ teamId, userId, expiresInHours = 72 }) {
    const rawCode = generateRandomToken(32);
    const tokenHash = hashToken(rawCode);
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO team_invites (team_id, token_hash, created_by, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id, expires_at;`,
        [teamId, tokenHash, userId, expiresAt]
      );

      // Audit invite creation without storing raw code in audit log
      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'invite.created', 'invite', $3, $4);`,
        [teamId, userId, rows[0].id, JSON.stringify({ expiresInHours })]
      );

      await client.query('COMMIT');

      return {
        id: rows[0].id,
        code: rawCode,
        expiresAt: rows[0].expires_at,
        teamId,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Redeem invite code to join a team
   */
  async joinTeamByInvite({ code, userId }) {
    const tokenHash = hashToken(code.trim());

    // 1. Locate valid, unexpired, unrevoked invite
    const { rows: inviteRows } = await db.query(
      `SELECT id, team_id, expires_at, revoked_at
       FROM team_invites
       WHERE token_hash = $1 LIMIT 1;`,
      [tokenHash]
    );

    if (inviteRows.length === 0) {
      throw new NotFoundError('Invalid invitation code.');
    }

    const invite = inviteRows[0];

    if (invite.revoked_at !== null) {
      throw new ConflictError('This invitation has been revoked by the team owner.');
    }

    if (new Date(invite.expires_at) < new Date()) {
      throw new ConflictError('This invitation has expired. Please request a new code.');
    }

    // 2. Check for duplicate membership
    const { rows: memberRows } = await db.query(
      `SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2 LIMIT 1;`,
      [invite.team_id, userId]
    );

    if (memberRows.length > 0) {
      throw new ConflictError('You are already a member of this team.');
    }

    // 3. Add member and record audit event
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, 'member');`,
        [invite.team_id, userId]
      );

      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'member.joined', 'user', $3, $4);`,
        [invite.team_id, userId, userId, JSON.stringify({ inviteId: invite.id })]
      );

      // 4. Return team summary
      const { rows: teamRows } = await client.query(
        `SELECT id, name FROM teams WHERE id = $1 LIMIT 1;`,
        [invite.team_id]
      );

      await client.query('COMMIT');

      return {
        team: teamRows[0],
        role: 'member',
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Revoke an active invite
   */
  async revokeInvite({ teamId, inviteId, userId }) {
    const { rows } = await db.query(
      `UPDATE team_invites
       SET revoked_at = now()
       WHERE id = $1 AND team_id = $2 AND revoked_at IS NULL
       RETURNING id;`,
      [inviteId, teamId]
    );

    if (rows.length === 0) {
      throw new NotFoundError('Active invite not found or already revoked.');
    }

    await db.query(
      `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, 'invite.revoked', 'invite', $3, '{}');`,
      [teamId, userId, inviteId]
    );

    return { revoked: true, inviteId };
  },

  /**
   * Remove member from team with owner safeguards
   */
  async removeMember({ teamId, targetUserId, requesterId }) {
    // Check if target is owner
    const { rows: targetRows } = await db.query(
      `SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2;`,
      [teamId, targetUserId]
    );

    if (targetRows.length === 0) {
      throw new NotFoundError('Member does not belong to this team.');
    }

    if (targetRows[0].role === 'owner') {
      throw new ForbiddenError('Team owner cannot be removed from the team.');
    }

    await db.query(
      `DELETE FROM team_members WHERE team_id = $1 AND user_id = $2;`,
      [teamId, targetUserId]
    );

    await db.query(
      `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, 'member.removed', 'user', $3, '{}');`,
      [teamId, requesterId, targetUserId]
    );

    return { removed: true, userId: targetUserId };
  },
};
