import { db } from '../config/db.js';

export const auditService = {
  /**
   * Retrieve chronologically descending audit records for a team
   */
  async getTeamAuditEvents(teamId, limit = 100) {
    const query = `
      SELECT
        a.id,
        a.team_id AS "teamId",
        a.actor_id AS "actorId",
        COALESCE(u.display_name, 'System') AS "actorName",
        u.email AS "actorEmail",
        a.action,
        a.entity_type AS "entityType",
        a.entity_id AS "entityId",
        a.metadata,
        a.created_at AS "createdAt"
      FROM audit_events a
      LEFT JOIN users u ON u.id = a.actor_id
      WHERE a.team_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2;
    `;

    const { rows } = await db.query(query, [teamId, Math.min(limit, 200)]);
    return rows;
  },
};
