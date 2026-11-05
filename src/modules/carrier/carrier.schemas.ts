import { z } from 'zod';
import { AnswersSchema, FieldValueSchema, IsoDateSchema, ReasonSchema } from '../../shared/schemas';

const CarrierSummarySchema = z
  .object({ id: z.string(), name: z.string(), product: z.string() })
  .meta({ id: 'CarrierSummary' });

// What a CarrierAdapter returns for each of the carrier's fields.
const FieldResolutionSchema = z
  .object({
    key: z.string(),
    source: z
      .enum(['profile', 'converted', 'suggested', 'ask'])
      .describe(
        'profile: copied as-is · converted: derived from the profile · suggested: a default the customer confirms · ask: the profile cannot answer it',
      ),
    value: FieldValueSchema.optional(),
    reason: z.string().describe('Why this field was resolved this way'),
    hint: z.string().optional().describe('Shown to the customer under the field'),
  })
  .meta({ id: 'FieldResolution' });

const EligibilityRequestSchema = z
  .object({
    customerId: z.string().min(1),
    answers: AnswersSchema.optional(),
    asOf: IsoDateSchema,
  })
  .meta({ id: 'EligibilityRequest' });

const EligibilityResultSchema = z
  .discriminatedUnion('status', [
    z.object({ status: z.literal('eligible') }),
    z.object({ status: z.literal('ineligible'), reasons: z.array(ReasonSchema).min(1) }),
    z.object({ status: z.literal('unknown'), pendingFields: z.array(z.string()).min(1) }),
  ])
  .meta({ id: 'EligibilityResult' });

const QuoteCreateRequestSchema = z
  .object({ customerId: z.string().min(1), answers: AnswersSchema, asOf: IsoDateSchema })
  .meta({ id: 'QuoteCreateRequest' });

const QuoteResponseSchema = z
  .object({
    quoteId: z.string(),
    carrierId: z.string(),
    request: AnswersSchema.describe("The carrier's quote request in its exact format"),
    sent: z.literal(false).describe('This exercise never sends the request to the carrier'),
  })
  .meta({ id: 'QuoteResponse' });

type CarrierSummary = z.infer<typeof CarrierSummarySchema>;
type FieldResolution = z.infer<typeof FieldResolutionSchema>;
type EligibilityRequest = z.infer<typeof EligibilityRequestSchema>;
type EligibilityResult = z.infer<typeof EligibilityResultSchema>;
type QuoteCreateRequest = z.infer<typeof QuoteCreateRequestSchema>;
type QuoteResponse = z.infer<typeof QuoteResponseSchema>;

export {
  type CarrierSummary,
  type FieldResolution,
  type EligibilityRequest,
  type EligibilityResult,
  type QuoteCreateRequest,
  type QuoteResponse,
  CarrierSummarySchema,
  FieldResolutionSchema,
  EligibilityRequestSchema,
  EligibilityResultSchema,
  QuoteCreateRequestSchema,
  QuoteResponseSchema,
};
