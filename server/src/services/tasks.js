import { db } from '../config/db.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

export const taskService = {
  /**
   * Retrieve all tasks for a specific team
   */
  async getTasks(teamId) {
    const query = `
      SELECT
        t.id,
        t.team_id AS "teamId",
        t.title,
        t.description,
        t.status,
        t.due_at AS "dueAt",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",
        json_build_object(
          'id', u_assignee.id,
          'displayName', u_assignee.display_name,
          'email', u_assignee.email
        ) AS "assignee",
        json_build_object(
          'id', u_creator.id,
          'displayName', u_creator.display_name
        ) AS "creator"
      FROM tasks t
      LEFT JOIN users u_assignee ON u_assignee.id = t.assignee_id
      INNER JOIN users u_creator ON u_creator.id = t.created_by
      WHERE t.team_id = $1
      ORDER BY t.created_at ASC;
    `;

    const { rows } = await db.query(query, [teamId]);
    return rows.map((r) => ({
      ...r,
      assignee: r.assignee.id ? r.assignee : null,
    }));
  },

  /**
   * Create a task and enforce that assignee is a verified team member
   */
  async createTask({ teamId, userId, title, description = null, assigneeId = null, dueAt = null, status = 'todo' }) {
    // 1. Verify assignee membership if assigned
    if (assigneeId) {
      const { rows: memberRows } = await db.query(
        'SELECT user_id FROM team_members WHERE team_id = $1 AND user_id = $2 LIMIT 1;',
        [teamId, assigneeId]
      );
      if (memberRows.length === 0) {
        throw new ValidationError('Assignee must be an active member of this team.');
      }
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO tasks (team_id, title, description, assignee_id, created_by, status, due_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, team_id AS "teamId", title, description, status, due_at AS "dueAt", created_at AS "createdAt";`,
        [teamId, title.trim(), description?.trim() || null, assigneeId || null, userId, status, dueAt || null]
      );

      const task = rows[0];

      // Audit task creation
      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'task.created', 'task', $3, $4);`,
        [teamId, userId, task.id, JSON.stringify({ title: task.title, status: task.status, assigneeId })]
      );

      await client.query('COMMIT');
      return task;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Update task fields with team boundary and assignee verification
   */
  async updateTask({ teamId, taskId, userId, updates }) {
    // 1. Verify task exists in this team
    const { rows: taskRows } = await db.query(
      'SELECT id, status, assignee_id, title FROM tasks WHERE id = $1 AND team_id = $2 LIMIT 1;',
      [taskId, teamId]
    );

    if (taskRows.length === 0) {
      throw new NotFoundError('Task not found in this team.');
    }

    const currentTask = taskRows[0];

    // 2. Validate new assignee membership if changed
    if (updates.assigneeId !== undefined && updates.assigneeId !== null) {
      const { rows: memberRows } = await db.query(
        'SELECT user_id FROM team_members WHERE team_id = $1 AND user_id = $2 LIMIT 1;',
        [teamId, updates.assigneeId]
      );
      if (memberRows.length === 0) {
        throw new ValidationError('Assignee must be an active member of this team.');
      }
    }

    // 3. Build dynamic update query
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(updates.title.trim());
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(updates.description ? updates.description.trim() : null);
    }
    if (updates.assigneeId !== undefined) {
      setClauses.push(`assignee_id = $${paramIndex++}`);
      values.push(updates.assigneeId || null);
    }
    if (updates.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.dueAt !== undefined) {
      setClauses.push(`due_at = $${paramIndex++}`);
      values.push(updates.dueAt || null);
    }

    setClauses.push(`updated_at = now()`);
    values.push(taskId, teamId);

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const updateQuery = `
        UPDATE tasks
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex++} AND team_id = $${paramIndex++}
        RETURNING id, team_id AS "teamId", title, description, status, due_at AS "dueAt", updated_at AS "updatedAt";
      `;

      const { rows } = await client.query(updateQuery, values);
      const updatedTask = rows[0];

      // Audit task modification
      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'task.updated', 'task', $3, $4);`,
        [
          teamId,
          userId,
          taskId,
          JSON.stringify({
            previousStatus: currentTask.status,
            newStatus: updatedTask.status,
            changes: Object.keys(updates),
          }),
        ]
      );

      await client.query('COMMIT');
      return updatedTask;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Delete task if requester is team owner or task creator
   */
  async deleteTask({ teamId, taskId, userId, userRole }) {
    const { rows: taskRows } = await db.query(
      'SELECT id, created_by, title FROM tasks WHERE id = $1 AND team_id = $2 LIMIT 1;',
      [taskId, teamId]
    );

    if (taskRows.length === 0) {
      throw new NotFoundError('Task not found in this team.');
    }

    const task = taskRows[0];

    if (userRole !== 'owner' && task.created_by !== userId) {
      throw new ForbiddenError('Only the team owner or task creator can delete this task.');
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      await client.query('DELETE FROM tasks WHERE id = $1 AND team_id = $2;', [taskId, teamId]);

      await client.query(
        `INSERT INTO audit_events (team_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'task.deleted', 'task', $3, $4);`,
        [teamId, userId, taskId, JSON.stringify({ title: task.title })]
      );

      await client.query('COMMIT');
      return { deleted: true, taskId };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
