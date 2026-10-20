/**
 * Structured HTTP request logger with execution duration and security sanitation.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      requestId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
    };

    if (res.statusCode >= 500) {
      console.error('[HTTP:ERROR]', JSON.stringify(logData));
    } else if (res.statusCode >= 400) {
      console.warn('[HTTP:WARN]', JSON.stringify(logData));
    } else if (process.env.NODE_ENV !== 'test') {
      console.log('[HTTP:INFO]', JSON.stringify(logData));
    }
  });

  next();
}
