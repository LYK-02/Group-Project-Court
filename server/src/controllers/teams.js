import { teamService } from '../services/teams.js';

export const teamController = {
  /**
   * Create a new team and grant owner role to current user
   */
  async createTeam(req, res, next) {
    try {
      const team = await teamService.createTeam({
        name: req.body.name,
        userId: req.user.id,
      });
      return res.status(201).json({ team });
    } catch (err) {
      next(err);
    }
  },

  /**
   * List all teams the current user is a member of
   */
  async getTeams(req, res, next) {
    try {
      const teams = await teamService.getUserTeams(req.user.id);
      return res.status(200).json({ teams });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Retrieve single team details and member list
   */
  async getTeam(req, res, next) {
    try {
      const team = await teamService.getTeamById(req.params.teamId);
      return res.status(200).json({ team });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create an invitation token for a team (Owner only)
   */
  async createInvite(req, res, next) {
    try {
      const invite = await teamService.createInvite({
        teamId: req.params.teamId,
        userId: req.user.id,
        expiresInHours: req.body.expiresInHours,
      });
      return res.status(201).json({ invite });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Redeem invitation token and join team
   */
  async joinTeam(req, res, next) {
    try {
      const result = await teamService.joinTeamByInvite({
        code: req.params.token,
        userId: req.user.id,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Revoke active invitation token (Owner only)
   */
  async revokeInvite(req, res, next) {
    try {
      const result = await teamService.revokeInvite({
        teamId: req.params.teamId,
        inviteId: req.params.inviteId,
        userId: req.user.id,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Remove member from team with owner safeguards
   */
  async removeMember(req, res, next) {
    try {
      const result = await teamService.removeMember({
        teamId: req.params.teamId,
        targetUserId: req.params.userId,
        requesterId: req.user.id,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
