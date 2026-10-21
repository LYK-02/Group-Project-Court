/**
 * Group Project Court — Database Seed Runner
 * Applies initial fictional student team fixture data for development and testing.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeeds(customPool = null) {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!customPool && !connectionString) {
    throw new Error('DATABASE_URL or DATABASE_URL_UNPOOLED environment variable is required to run seeds.');
  }

  const ssl = connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined;
  const pool = customPool || new pg.Pool({ connectionString, ssl });
  const client = await pool.connect();

  try {
    const seedFile = path.join(__dirname, 'seeds', '001_demo_seed.sql');
    const sql = await fs.readFile(seedFile, 'utf8');

    console.log('[seed] Executing 001_demo_seed.sql...');
    await client.query(sql);
    console.log('[seed] Demo dataset successfully seeded.');
  } finally {
    client.release();
    if (!customPool) {
      await pool.end();
    }
  }
}

// Execute directly if run via CLI
const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectExecution) {
  runSeeds()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[seed] Seed runner encountered a fatal error:', err);
      process.exit(1);
    });
}
