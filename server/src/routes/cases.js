import { Router } from 'express';
import { caseController } from '../controllers/cases.js';
import { requireAuth, requireTeamMember } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { teamIdParamSchema } from '../validators/teams.js';
import {
  createCaseSchema,
  teamAndCaseParamsSchema,
  createEvidenceSchema,
  submitVoteSchema,
  shareTokenParamSchema,
} from '../validators/cases.js';

const router = Router();

/**
 * Public routes (No auth required)
 * GET /api/v1/public/cases/:token
 */
router.get(
  '/public/cases/:token',
  validate(shareTokenParamSchema, 'params'),
  caseController.getPublicCase
);

/**
 * Authenticated Team Dispute Case Routes
 */

// List cases for team
router.get(
  '/teams/:teamId/cases',
  requireAuth,
  validate(teamIdParamSchema, 'params'),
  requireTeamMember,
  caseController.getCases
);

// File a dispute case
router.post(
  '/teams/:teamId/cases',
  requireAuth,
  validate(teamIdParamSchema, 'params'),
  requireTeamMember,
  validate(createCaseSchema, 'body'),
  caseController.createCase
);

// Get single case details & evidence
router.get(
  '/teams/:teamId/cases/:caseId',
  requireAuth,
  validate(teamAndCaseParamsSchema, 'params'),
  requireTeamMember,
  caseController.getCase
);

// Submit evidence
router.post(
  '/teams/:teamId/cases/:caseId/evidence',
  requireAuth,
  validate(teamAndCaseParamsSchema, 'params'),
  requireTeamMember,
  validate(createEvidenceSchema, 'body'),
  caseController.addEvidence
);

// Cast / update juror vote
router.post(
  '/teams/:teamId/cases/:caseId/votes',
  requireAuth,
  validate(teamAndCaseParamsSchema, 'params'),
  requireTeamMember,
  validate(submitVoteSchema, 'body'),
  caseController.submitVote
);

// Close trial and deliver verdict
router.post(
  '/teams/:teamId/cases/:caseId/close',
  requireAuth,
  validate(teamAndCaseParamsSchema, 'params'),
  requireTeamMember,
  caseController.closeCase
);

// Generate public share token
router.post(
  '/teams/:teamId/cases/:caseId/share',
  requireAuth,
  validate(teamAndCaseParamsSchema, 'params'),
  requireTeamMember,
  caseController.shareCase
);

// Revoke public share token
router.delete(
  '/teams/:teamId/cases/:caseId/share',
  requireAuth,
  validate(teamAndCaseParamsSchema, 'params'),
  requireTeamMember,
  caseController.revokeShare
);

export default router;
