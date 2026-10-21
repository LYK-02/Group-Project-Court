import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { sessionMiddleware } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import teamsRouter from './routes/teams.js';
import tasksRouter from './routes/tasks.js';
import casesRouter from './routes/cases.js';

export function createApp() {
  const app = express();

  // 1. Trust first proxy hop if running behind reverse proxy
  app.set('trust proxy', 1);

  // 2. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 3. CORS Policy
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
    })
  );

  // 4. Request IDs and Structured Logging
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  // 5. Bounded Body Parser
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 6. Global API Rate Limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down and try again later.',
      },
    },
  });

  // Apply rate limiter to API routes in non-test environments
  if (env.NODE_ENV !== 'test') {
    app.use('/api', limiter);
  }

  // 7. Session Middleware
  app.use(sessionMiddleware);

  // 8. Mount Versioned API Routes
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', authRouter);
  app.use('/api/v1', teamsRouter);
  app.use('/api/v1', tasksRouter);
  app.use('/api/v1', casesRouter);

  // 8. 404 and Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
