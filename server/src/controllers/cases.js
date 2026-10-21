import { caseService } from '../services/cases.js';

export const caseController = {
  /**
   * List all dispute cases for the team
   */
  async getCases(req, res, next) {
    try {
      const cases = await caseService.getTeamCases(req.params.teamId);
      return res.status(200).json({ cases });
    } catch (err) {
      next(err);
    }
  },

  /**
   * File a new dispute case
   */
  async createCase(req, res, next) {
    try {
      const newCase = await caseService.createCase({
        teamId: req.params.teamId,
        userId: req.user.id,
        ...req.body,
      });
      return res.status(201).json({ case: newCase });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single case details with evidence and vote status
   */
  async getCase(req, res, next) {
    try {
      const caseData = await caseService.getCaseById({
        caseId: req.params.caseId,
        userId: req.user.id,
        teamId: req.params.teamId,
      });
      return res.status(200).json({ case: caseData });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Submit evidence to a case
   */
  async addEvidence(req, res, next) {
    try {
      const evidence = await caseService.addEvidence({
        caseId: req.params.caseId,
        userId: req.user.id,
        teamId: req.params.teamId,
        ...req.body,
      });
      return res.status(201).json({ evidence });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Submit juror vote
   */
  async submitVote(req, res, next) {
    try {
      const result = await caseService.submitVote({
        caseId: req.params.caseId,
        userId: req.user.id,
        teamId: req.params.teamId,
        choice: req.body.choice,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Conclude jury trial, calculate consensus verdict, and close case
   */
  async closeCase(req, res, next) {
    try {
      const closedCase = await caseService.closeCaseAndDeliverVerdict({
        caseId: req.params.caseId,
        teamId: req.params.teamId,
        userId: req.user.id,
        userRole: req.membership.role,
      });
      return res.status(200).json({ case: closedCase });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Generate high-entropy public share token
   */
  async shareCase(req, res, next) {
    try {
      const shareData = await caseService.shareCase({
        caseId: req.params.caseId,
        teamId: req.params.teamId,
        userId: req.user.id,
      });
      return res.status(200).json(shareData);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Revoke public share link
   */
  async revokeShare(req, res, next) {
    try {
      const revokeData = await caseService.revokeShareCase({
        caseId: req.params.caseId,
        teamId: req.params.teamId,
        userId: req.user.id,
      });
      return res.status(200).json(revokeData);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Public read-only sanitized case view (no auth required)
   */
  async getPublicCase(req, res, next) {
    try {
      const publicData = await caseService.getPublicCase(req.params.token);
      return res.status(200).json({ case: publicData });
    } catch (err) {
      next(err);
    }
  },
};
