import crypto from 'node:crypto';

/**
 * Generates a cryptographically secure random token (64 hex characters)
 */
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Computes SHA-256 hash of a raw token for storage and lookup
 */
export function hashToken(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new Error('Token must be a non-empty string');
  }
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
