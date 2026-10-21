import { auditService } from '../services/audit.js';

export const auditController = {
  /**
   * Retrieve chronological audit records for team
   */
  async getTeamAudit(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
      const events = await auditService.getTeamAuditEvents(req.params.teamId, limit);
      return res.status(200).json({ events });
    } catch (err) {
      next(err);
    }
  },
};
