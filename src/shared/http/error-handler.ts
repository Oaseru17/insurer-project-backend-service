import type { ErrorRequestHandler } from 'express';
import type { Logger } from '../logger';
import type { ErrorResponse } from '../schemas';
import { HttpError } from './errors';

const INTERNAL_ERROR: ErrorResponse = {
  error: { code: 'internal_error', message: 'Something went wrong' },
};

// express.json() reports unparseable bodies this way.
function isMalformedJson(err: unknown): boolean {
  return (
    typeof err === 'object' && err !== null && 'type' in err && err.type === 'entity.parse.failed'
  );
}

function errorHandler(logger: Logger): ErrorRequestHandler {
  return (err: unknown, req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.status).json(err.toResponse());
      return;
    }
    if (isMalformedJson(err)) {
      res.status(400).json({
        error: { code: 'invalid_request', message: 'The request body is not valid JSON' },
      } satisfies ErrorResponse);
      return;
    }
    logger.error('unhandled error', {
      method: req.method,
      path: req.path,
      error: err instanceof Error ? { name: err.name, message: err.message } : String(err),
    });
    res.status(500).json(INTERNAL_ERROR);
  };
}

export { errorHandler };
