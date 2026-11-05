import { z } from 'zod';
import { ReasonSchema } from './reason.schema';

const ErrorResponseSchema = z
  .object({
    error: z.object({
      code: z.enum(['invalid_request', 'not_found', 'ineligible', 'internal_error']),
      message: z.string(),
      issues: z
        .array(z.object({ path: z.string(), message: z.string(), code: z.string().optional() }))
        .optional(),
      reasons: z.array(ReasonSchema).optional(),
    }),
  })
  .meta({ id: 'ErrorResponse' });

type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export { type ErrorResponse, ErrorResponseSchema };
