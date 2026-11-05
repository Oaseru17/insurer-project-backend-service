import { z } from 'zod';
import { parseIsoDate } from './dates';

// Schemas every module uses. Module-specific request/response schemas live with their module
// (`modules/<name>/<name>.schemas.ts`); together they generate the OpenAPI document.

const IsoDateSchema = z
  .string()
  .refine((value) => parseIsoDate(value) !== null, 'must be a real calendar date, YYYY-MM-DD')
  .meta({ id: 'IsoDate', example: '2026-11-05' });

const FieldValueSchema = z
  .union([z.string(), z.number(), z.boolean(), z.array(z.string())])
  .meta({ id: 'FieldValue' });

const AnswersSchema = z
  .record(z.string(), FieldValueSchema)
  .meta({ id: 'Answers', description: "Keyed by the carrier's field keys." });

const ReasonSchema = z
  .object({
    code: z.string(),
    field: z.string().optional(),
    message: z.string(),
  })
  .meta({ id: 'Reason' });

const ErrorResponseSchema = z
  .object({
    error: z.object({
      code: z.enum(['invalid_request', 'not_found', 'ineligible', 'internal_error']),
      message: z.string(),
      issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
      reasons: z.array(ReasonSchema).optional(),
    }),
  })
  .meta({ id: 'ErrorResponse' });

type FieldValue = z.infer<typeof FieldValueSchema>;
type Answers = z.infer<typeof AnswersSchema>;
type Reason = z.infer<typeof ReasonSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export {
  type FieldValue,
  type Answers,
  type Reason,
  type ErrorResponse,
  IsoDateSchema,
  FieldValueSchema,
  AnswersSchema,
  ReasonSchema,
  ErrorResponseSchema,
};
