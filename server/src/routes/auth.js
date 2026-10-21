import { Router } from 'express';
import { authController } from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.js';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Public registration endpoint
 */
router.post('/auth/register', validate(registerSchema, 'body'), authController.register);

/**
 * POST /api/v1/auth/login
 * Public login endpoint
 */
router.post('/auth/login', validate(loginSchema, 'body'), authController.login);

/**
 * POST /api/v1/auth/logout
 * Terminate session
 */
router.post('/auth/logout', requireAuth, authController.logout);

/**
 * GET /api/v1/auth/me
 * Current authenticated user profile
 */
router.get('/auth/me', requireAuth, authController.me);

export default router;
