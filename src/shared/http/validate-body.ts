import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { ValidationError } from './errors';

function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new ValidationError(
          result.error.issues.map((issue) => ({
            path: issue.path.join('.') || '(body)',
            message: issue.message,
          })),
        ),
      );
      return;
    }
    req.body = result.data;
    next();
  };
}

export { validateBody };
