import { Router } from 'express';
import { teamController } from '../controllers/teams.js';
import { requireAuth, requireTeamMember, requireTeamOwner } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createTeamSchema,
  createInviteSchema,
  teamIdParamSchema,
  teamMemberParamSchema,
  inviteTokenParamSchema,
  inviteIdParamSchema,
} from '../validators/teams.js';

const router = Router();

/**
 * POST /api/v1/teams
 * Create a new team
 */
router.post(
  '/teams',
  requireAuth,
  validate(createTeamSchema, 'body'),
  teamController.createTeam
);

/**
 * GET /api/v1/teams
 * List teams for current user
 */
router.get(
  '/teams',
  requireAuth,
  teamController.getTeams
);

/**
 * GET /api/v1/teams/:teamId
 * Retrieve single team details and member roster (members only)
 */
router.get(
  '/teams/:teamId',
  requireAuth,
  validate(teamIdParamSchema, 'params'),
  requireTeamMember,
  teamController.getTeam
);

/**
 * POST /api/v1/teams/:teamId/invites
 * Create a new invite token (owner only)
 */
router.post(
  '/teams/:teamId/invites',
  requireAuth,
  validate(teamIdParamSchema, 'params'),
  requireTeamOwner,
  validate(createInviteSchema, 'body'),
  teamController.createInvite
);

/**
 * POST /api/v1/invites/:token/join
 * Redeem invitation token to join team
 */
router.post(
  '/invites/:token/join',
  requireAuth,
  validate(inviteTokenParamSchema, 'params'),
  teamController.joinTeam
);

/**
 * DELETE /api/v1/teams/:teamId/invites/:inviteId
 * Revoke an active invitation token (owner only)
 */
router.delete(
  '/teams/:teamId/invites/:inviteId',
  requireAuth,
  validate(inviteIdParamSchema, 'params'),
  requireTeamOwner,
  teamController.revokeInvite
);

/**
 * DELETE /api/v1/teams/:teamId/members/:userId
 * Remove a member from a team (owner only, with safeguards)
 */
router.delete(
  '/teams/:teamId/members/:userId',
  requireAuth,
  validate(teamMemberParamSchema, 'params'),
  requireTeamOwner,
  teamController.removeMember
);

export default router;
