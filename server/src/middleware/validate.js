/**
 * Request validation middleware using Zod schemas
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'params' | 'query'} [source='body'] - Request property to validate
 * @returns {import('express').RequestHandler}
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };
}
