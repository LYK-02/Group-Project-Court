import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

/**
 * 404 Catch-all handler for undefined routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl || req.url}`,
      requestId: req.id || 'unknown',
    },
  });
}

/**
 * Centralized error handler returning consistent TRD JSON error objects
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const requestId = req.id || 'unknown';

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid fields.',
        requestId,
        details: process.env.NODE_ENV !== 'production' ? details : undefined,
      },
    });
  }

  // 2. Custom AppErrors (Unauthorized, Forbidden, Conflict, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // 3. PostgreSQL Database Errors (Map duplicate key conflicts safely)
  if (err.code === '23505') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A resource with these unique identifiers already exists.',
        requestId,
      },
    });
  }

  // 4. Unexpected / Unhandled Errors
  console.error('[UNHANDLED_EXCEPTION]', {
    requestId,
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.',
      requestId,
    },
  });
}
