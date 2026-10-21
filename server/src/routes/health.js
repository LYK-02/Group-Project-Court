import { Router } from 'express';
import { db } from '../config/db.js';

const router = Router();

/**
 * GET /api/v1/health
 * Returns service liveness and database connectivity status.
 * Never exposes passwords, host details, or sensitive internals.
 */
router.get('/health', async (req, res) => {
  const dbHealth = await db.checkHealth();
  const isHealthy = dbHealth.status === 'healthy';

  const responsePayload = {
    status: isHealthy ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
      status: dbHealth.status,
      latencyMs: dbHealth.latencyMs,
      provider: dbHealth.isNeon ? 'Neon Serverless Postgres' : 'PostgreSQL',
      branch: dbHealth.neonBranch || undefined,
    },
  };

  res.status(isHealthy ? 200 : 503).json(responsePayload);
});

export default router;
