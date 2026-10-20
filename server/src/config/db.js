import pg from 'pg';
import { env } from './env.js';

const connectionString = env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL : env.DATABASE_URL;

const isNeon = connectionString && (connectionString.includes('neon.tech') || connectionString.includes('sslmode=require'));
const ssl = isNeon ? { rejectUnauthorized: false } : undefined;

let pool = new pg.Pool({
  connectionString,
  ssl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Suppress unhandled error crashes on idle pool clients
pool.on('error', (err) => {
  console.error('[db] Unexpected idle client error:', err.message);
});

export const db = {
  /**
   * Execute parameterized query against the pool
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.warn('[db:query:slow]', { text, durationMs: duration });
      }
      return res;
    } catch (err) {
      console.error('[db:query:error]', { text, error: err.message });
      throw err;
    }
  },

  /**
   * Acquire a dedicated client from the pool (e.g. for multi-statement transactions)
   */
  async getClient() {
    return pool.connect();
  },

  /**
   * Ping database to verify connection health
   */
  async checkHealth() {
    const start = Date.now();
    try {
      await pool.query('SELECT 1;');
      return {
        status: 'healthy',
        latencyMs: Date.now() - start,
        isNeon: Boolean(isNeon),
        neonBranch: env.NEON_BRANCH || null,
      };
    } catch (err) {
      return {
        status: 'unhealthy',
        latencyMs: Date.now() - start,
        error: env.NODE_ENV === 'production' ? 'Database connection unavailable' : err.message,
      };
    }
  },

  /**
   * Graceful pool teardown
   */
  async close() {
    await pool.end();
  },

  /**
   * Allow injecting custom pool (useful in test harnesses e.g. pg-mem)
   */
  setPool(customPool) {
    pool = customPool;
  },

  getPool() {
    return pool;
  },
};
