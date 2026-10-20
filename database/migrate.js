/**
 * Group Project Court — Database Migration Runner
 * Executes versioned SQL migrations in transactional order and tracks them
 * in the schema_migrations table.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(customPool = null) {
  const connectionString = process.env.DATABASE_URL;
  if (!customPool && !connectionString) {
    throw new Error('DATABASE_URL environment variable is required to run migrations.');
  }

  const pool = customPool || new pg.Pool({ connectionString });
  const client = await pool.connect();

  try {
    // 1. Create migration history tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 2. Discover migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    // 3. Query already applied migrations
    const { rows: appliedRows } = await client.query('SELECT name FROM schema_migrations;');
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    // 4. Apply pending migrations sequentially inside transactions
    let appliedCount = 0;
    for (const file of files) {
      if (!appliedSet.has(file)) {
        console.log(`[migrate] Applying: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (name) VALUES ($1);', [file]);
          await client.query('COMMIT');
          appliedCount++;
          console.log(`[migrate] Applied: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[migrate] Failed migration ${file}:`, err.message);
          throw err;
        }
      }
    }

    if (appliedCount === 0) {
      console.log('[migrate] Database is up to date. No pending migrations.');
    } else {
      console.log(`[migrate] Successfully applied ${appliedCount} migration(s).`);
    }

    return appliedCount;
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
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[migrate] Migration runner encountered a fatal error:', err);
      process.exit(1);
    });
}
