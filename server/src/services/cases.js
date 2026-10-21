import { db } from '../config/db.js';
import { generateRandomToken, hashToken } from '../utils/tokens.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';

export const caseService = {
  /**
   * List all cases for a team with vote tallies
   */
  async getTeamCases(teamId) {
    const query = `
      SELECT
        c.id,
        c.team_id AS "teamId",
        c.title,
        c.description,
        c.status,
        c.created_at AS "createdAt",
        c.closed_at AS "closedAt",
        c.verdict,
        c.verdict_rule_version AS "verdictRuleVersion",
        c.published_at AS "publishedAt",
        (c.share_token_hash IS NOT NULL) AS "isShared",
        json_build_object(
          'id', u_creator.id,
          'displayName', u_creator.display_name
        ) AS "creator",
        COALESCE(
          json_build_object(
            'fair', COUNT(CASE WHEN v.choice = 'fair' THEN 1 END)::int,
            'needsReview', COUNT(CASE WHEN v.choice = 'needs_review' THEN 1 END)::int,
            'unfair', COUNT(CASE WHEN v.choice = 'unfair' THEN 1 END)::int,
            'total', COUNT(v.id)::int
          ),
          '{"fair":0,"needsReview":0,"unfair":0,"total":0}'::json
        ) AS "voteStats"
      FROM cases c
      INNER JOIN users u_creator ON u_creator.id = c.created_by
      LEFT JOIN votes v ON v.case_id = c.id
      WHERE c.team_id = $1
      GROUP BY c.id, u_creator.id, u_creator.display_name
      ORDER BY c.created_at DESC;
    `;

    const { rows } = await db.query(query, [teamId]);
    return rows;
  },

  /**
   * File a dispute case for the team
   */
  async createCase({ teamId, userId, title, description = null, status = 'open' }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO cases (team_id, title, description, status, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, team_id AS "teamId", title, description, status, created_at AS "createdAt";`,
        [teamId, title.trim(), description?.trim() || null, status, userId]
      );

      const newCase = rows[0];

      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'case.opened', 'case', $3, $4);`,
        [teamId, userId, newCase.id, JSON.stringify({ title: newCase.title, status: newCase.status })]
      );

      await client.query('COMMIT');
      return newCase;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Get single case dossier, filtered evidence list, and user's own vote
   */
  async getCaseById({ caseId, userId, teamId }) {
    // 1. Fetch case record
    const { rows: caseRows } = await db.query(
      `SELECT
         c.id,
         c.team_id AS "teamId",
         c.title,
         c.description,
         c.status,
         c.verdict,
         c.verdict_rule_version AS "verdictRuleVersion",
         c.created_at AS "createdAt",
         c.closed_at AS "closedAt",
         c.published_at AS "publishedAt",
         (c.share_token_hash IS NOT NULL) AS "isShared",
         json_build_object(
           'id', u_creator.id,
           'displayName', u_creator.display_name
         ) AS "creator"
       FROM cases c
       INNER JOIN users u_creator ON u_creator.id = c.created_by
       WHERE c.id = $1 AND c.team_id = $2 LIMIT 1;`,
      [caseId, teamId]
    );

    if (caseRows.length === 0) {
      throw new NotFoundError('Dispute case not found in this team.');
    }

    const currentCase = caseRows[0];

    // 2. Fetch evidence respecting privacy (team visible OR submitted by current user)
    const { rows: evidenceRows } = await db.query(
      `SELECT
         e.id,
         e.case_id AS "caseId",
         e.kind,
         e.content,
         e.visibility,
         e.created_at AS "createdAt",
         json_build_object(
           'id', u.id,
           'displayName', u.display_name
         ) AS "submitter"
       FROM evidence e
       INNER JOIN users u ON u.id = e.submitted_by
       WHERE e.case_id = $1 AND (e.visibility = 'team' OR e.submitted_by = $2)
       ORDER BY e.created_at ASC;`,
      [caseId, userId]
    );

    // 3. Fetch vote statistics and caller's own vote
    const { rows: voteRows } = await db.query(
      `SELECT
         COUNT(CASE WHEN choice = 'fair' THEN 1 END)::int AS "fair",
         COUNT(CASE WHEN choice = 'needs_review' THEN 1 END)::int AS "needsReview",
         COUNT(CASE WHEN choice = 'unfair' THEN 1 END)::int AS "unfair",
         COUNT(*)::int AS "total"
       FROM votes WHERE case_id = $1;`,
      [caseId]
    );

    const { rows: userVoteRows } = await db.query(
      'SELECT choice FROM votes WHERE case_id = $1 AND user_id = $2 LIMIT 1;',
      [caseId, userId]
    );

    return {
      ...currentCase,
      evidence: evidenceRows,
      voteStats: voteRows[0] || { fair: 0, needsReview: 0, unfair: 0, total: 0 },
      userVote: userVoteRows[0]?.choice || null,
    };
  },

  /**
   * Submit testimony / evidence note or URL
   */
  async addEvidence({ caseId, userId, teamId, kind, content, visibility = 'team' }) {
    // Verify case exists and is not closed
    const { rows: caseRows } = await db.query(
      'SELECT id, status FROM cases WHERE id = $1 AND team_id = $2 LIMIT 1;',
      [caseId, teamId]
    );

    if (caseRows.length === 0) {
      throw new NotFoundError('Dispute case not found.');
    }

    if (caseRows[0].status === 'closed') {
      throw new ConflictError('Cannot submit evidence to a closed dispute case.');
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO evidence (case_id, submitted_by, kind, content, visibility)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, case_id AS "caseId", kind, content, visibility, created_at AS "createdAt";`,
        [caseId, userId, kind, content.trim(), visibility]
      );

      const evidence = rows[0];

      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'evidence.submitted', 'evidence', $3, $4);`,
        [teamId, userId, evidence.id, JSON.stringify({ kind, visibility })]
      );

      await client.query('COMMIT');
      return evidence;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Submit or update a juror vote (enforces one vote per user)
   */
  async submitVote({ caseId, userId, teamId, choice }) {
    // 1. Verify case is open for jury voting
    const { rows: caseRows } = await db.query(
      'SELECT id, status FROM cases WHERE id = $1 AND team_id = $2 LIMIT 1;',
      [caseId, teamId]
    );

    if (caseRows.length === 0) {
      throw new NotFoundError('Case not found.');
    }

    if (caseRows[0].status !== 'open') {
      throw new ConflictError('Voting is closed for this case.');
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Upsert vote constraint
      const { rows: voteRows } = await client.query(
        `INSERT INTO votes (case_id, user_id, choice)
         VALUES ($1, $2, $3)
         ON CONFLICT (case_id, user_id)
         DO UPDATE SET choice = EXCLUDED.choice, updated_at = now()
         RETURNING id, choice;`,
        [caseId, userId, choice]
      );

      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'vote.cast', 'case', $3, $4);`,
        [teamId, userId, caseId, JSON.stringify({ choice })]
      );

      await client.query('COMMIT');
      return { voted: true, choice: voteRows[0].choice };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Close case and calculate satirical consensus verdict in a concurrency-safe transaction
   */
  async closeCaseAndDeliverVerdict({ caseId, teamId, userId, userRole }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // 1. Acquire exclusive lock on case row to prevent race conditions
      const { rows: caseRows } = await client.query(
        'SELECT id, title, status, created_by FROM cases WHERE id = $1 AND team_id = $2 FOR UPDATE;',
        [caseId, teamId]
      );

      if (caseRows.length === 0) {
        throw new NotFoundError('Case not found.');
      }

      const c = caseRows[0];

      if (c.status === 'closed') {
        throw new ConflictError('This case has already been adjudicated and closed.');
      }

      if (userRole !== 'owner' && c.created_by !== userId) {
        throw new ForbiddenError('Only the team owner or case filer can close this case.');
      }

      // 2. Tally jury consensus
      const { rows: tallyRows } = await client.query(
        `SELECT
           COUNT(CASE WHEN choice = 'fair' THEN 1 END)::int AS "fair",
           COUNT(CASE WHEN choice = 'needs_review' THEN 1 END)::int AS "needsReview",
           COUNT(CASE WHEN choice = 'unfair' THEN 1 END)::int AS "unfair",
           COUNT(*)::int AS "total"
         FROM votes WHERE case_id = $1;`,
        [caseId]
      );

      const tallies = tallyRows[0] || { fair: 0, needsReview: 0, unfair: 0, total: 0 };

      // 3. Formulate satirical consensus verdict (per PRD)
      let verdict;
      if (tallies.total === 0) {
        verdict = 'DISMISSED FOR LACK OF JURY PARTICIPATION: The bench finds insufficient witness quorum. Case archived without prejudice.';
      } else if (tallies.unfair >= tallies.fair && tallies.unfair >= tallies.needsReview) {
        verdict = `GUILTY AS CHARGED: By a jury majority (${tallies.unfair} unfair votes of ${tallies.total}), the bench finds extreme contribution deficit. Sentenced to mandatory git merge-conflict resolution duty and bringing coffee/donuts to the next sprint.`;
      } else if (tallies.fair > tallies.unfair && tallies.fair >= tallies.needsReview) {
        verdict = `HONORABLY ACQUITTED: The court finds reasonable doubt (${tallies.fair} fair votes of ${tallies.total}). The defendant is granted full peer immunity for this milestone.`;
      } else {
        verdict = `COMPROMISE DECREE: The jury finds gross communication divergence (${tallies.needsReview} requests for review). The court orders a mandatory 30-minute sync meeting with transparent task reallocation.`;
      }

      const ruleVersion = 'v1.0-strict-consensus';

      // 4. Update case state
      const { rows: updatedRows } = await client.query(
        `UPDATE cases
         SET status = 'closed',
             closed_by = $1,
             closed_at = now(),
             verdict = $2,
             verdict_rule_version = $3,
             updated_at = now()
         WHERE id = $4
         RETURNING id, status, verdict, verdict_rule_version AS "verdictRuleVersion", closed_at AS "closedAt";`,
        [userId, verdict, ruleVersion, caseId]
      );

      // 5. Log audit event
      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'case.closed', 'case', $3, $4);`,
        [teamId, userId, caseId, JSON.stringify({ verdict, tally: tallies })]
      );

      await client.query('COMMIT');
      return updatedRows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Issue high-entropy public share token for case
   */
  async shareCase({ caseId, teamId, userId }) {
    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);

    const { rows } = await db.query(
      `UPDATE cases
       SET share_token_hash = $1, published_at = now(), updated_at = now()
       WHERE id = $2 AND team_id = $3
       RETURNING id, published_at AS "publishedAt";`,
      [tokenHash, caseId, teamId]
    );

    if (rows.length === 0) {
      throw new NotFoundError('Case not found.');
    }

    await db.query(
      `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, 'case.shared', 'case', $3, '{}');`,
      [teamId, userId, caseId]
    );

    return {
      shared: true,
      token: rawToken,
      publishedAt: rows[0].publishedAt,
    };
  },

  /**
   * Revoke public share link
   */
  async revokeShareCase({ caseId, teamId, userId }) {
    const { rows } = await db.query(
      `UPDATE cases
       SET share_token_hash = NULL, published_at = NULL, updated_at = now()
       WHERE id = $1 AND team_id = $2
       RETURNING id;`,
      [caseId, teamId]
    );

    if (rows.length === 0) {
      throw new NotFoundError('Case not found.');
    }

    await db.query(
      `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, 'case.share_revoked', 'case', $3, '{}');`,
      [teamId, userId, caseId]
    );

    return { revoked: true };
  },

  /**
   * Public sanitized case readout (no private submitter evidence, no email addresses, no internal tokens)
   */
  async getPublicCase(rawToken) {
    const tokenHash = hashToken(rawToken.trim());

    const { rows: caseRows } = await db.query(
      `SELECT
         id,
         title,
         description,
         status,
         verdict,
         verdict_rule_version AS "verdictRuleVersion",
         published_at AS "publishedAt",
         closed_at AS "closedAt"
       FROM cases
       WHERE share_token_hash = $1 AND published_at IS NOT NULL
       LIMIT 1;`,
      [tokenHash]
    );

    if (caseRows.length === 0) {
      throw new NotFoundError('Public case summary not found or sharing has been revoked.');
    }

    const c = caseRows[0];

    // Only public team-level evidence is exposed
    const { rows: publicEvidence } = await db.query(
      `SELECT
         kind,
         content,
         created_at AS "createdAt"
       FROM evidence
       WHERE case_id = $1 AND visibility = 'team'
       ORDER BY created_at ASC;`,
      [c.id]
    );

    // Public vote statistics
    const { rows: tallyRows } = await db.query(
      `SELECT
         COUNT(CASE WHEN choice = 'fair' THEN 1 END)::int AS "fair",
         COUNT(CASE WHEN choice = 'needs_review' THEN 1 END)::int AS "needsReview",
         COUNT(CASE WHEN choice = 'unfair' THEN 1 END)::int AS "unfair",
         COUNT(*)::int AS "total"
       FROM votes WHERE case_id = $1;`,
      [c.id]
    );

    return {
      title: c.title,
      description: c.description,
      status: c.status,
      verdict: c.verdict,
      verdictRuleVersion: c.verdictRuleVersion,
      publishedAt: c.publishedAt,
      closedAt: c.closedAt,
      evidence: publicEvidence,
      voteStats: tallyRows[0] || { fair: 0, needsReview: 0, unfair: 0, total: 0 },
    };
  },
};
