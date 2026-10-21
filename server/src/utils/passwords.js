import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt with standard work factor
 */
export async function hashPassword(plainTextPassword) {
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

/**
 * Compares plaintext password against stored hash safely
 */
export async function verifyPassword(plainTextPassword, storedHash) {
  if (!plainTextPassword || !storedHash) {
    return false;
  }
  return bcrypt.compare(plainTextPassword, storedHash);
}
