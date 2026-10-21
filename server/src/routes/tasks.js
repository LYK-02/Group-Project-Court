import { Router } from 'express';
import { taskController } from '../controllers/tasks.js';
import { auditController } from '../controllers/audit.js';
import { requireAuth, requireTeamMember } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { teamIdParamSchema } from '../validators/teams.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
} from '../validators/tasks.js';

const router = Router();

/**
 * GET /api/v1/teams/:teamId/tasks
 * List tasks for team members
 */
router.get(
  '/teams/:teamId/tasks',
  requireAuth,
  validate(teamIdParamSchema, 'params'),
  requireTeamMember,
  taskController.getTasks
);

/**
 * POST /api/v1/teams/:teamId/tasks
 * Create task for team with member validation
 */
router.post(
  '/teams/:teamId/tasks',
  requireAuth,
  validate(teamIdParamSchema, 'params'),
  requireTeamMember,
  validate(createTaskSchema, 'body'),
  taskController.createTask
);

/**
 * PATCH /api/v1/teams/:teamId/tasks/:taskId
 * Update task attributes and status
 */
router.patch(
  '/teams/:teamId/tasks/:taskId',
  requireAuth,
  validate(taskIdParamSchema, 'params'),
  requireTeamMember,
  validate(updateTaskSchema, 'body'),
  taskController.updateTask
);

/**
 * DELETE /api/v1/teams/:teamId/tasks/:taskId
 * Delete task (owner or task creator only)
 */
router.delete(
  '/teams/:teamId/tasks/:taskId',
  requireAuth,
  validate(taskIdParamSchema, 'params'),
  requireTeamMember,
  taskController.deleteTask
);

/**
 * GET /api/v1/teams/:teamId/audit
 * Retrieve team audit trail
 */
router.get(
  '/teams/:teamId/audit',
  requireAuth,
  validate(teamIdParamSchema, 'params'),
  requireTeamMember,
  auditController.getTeamAudit
);

export default router;
