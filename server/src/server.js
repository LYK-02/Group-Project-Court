import { app } from './app.js';
import { env } from './config/env.js';
import { db } from './config/db.js';

const server = app.listen(env.PORT, () => {
  console.log(`[server] Group Project Court API listening on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`[server] Health check accessible at: http://localhost:${env.PORT}/api/v1/health`);
});

// Graceful process termination
async function handleShutdown(signal) {
  console.log(`[server] Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    console.log('[server] HTTP listener closed.');
    try {
      await db.close();
      console.log('[server] Database pool drained.');
      process.exit(0);
    } catch (err) {
      console.error('[server] Error during database shutdown:', err.message);
      process.exit(1);
    }
  });

  // Force termination if cleanup takes longer than 10 seconds
  setTimeout(() => {
    console.error('[server] Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
