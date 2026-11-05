import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { ValidationError } from './errors';

// Express 5's req.query is read-only, so the parsed query is handed on in res.locals.query.
function validateQuery(schema: z.ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(
        new ValidationError(
          result.error.issues.map((issue) => ({
            path: issue.path.join('.') || '(query)',
            message: issue.message,
          })),
        ),
      );
      return;
    }
    res.locals.query = result.data;
    next();
  };
}

export { validateQuery };
