import { z } from 'zod';
import { AnswersSchema } from '../../../shared/schemas';

const QuoteResponseSchema = z
  .object({
    quoteId: z.string(),
    carrierId: z.string(),
    request: AnswersSchema.describe("The carrier's quote request in its exact format"),
    sent: z.literal(false).describe('This exercise never sends the request to the carrier'),
  })
  .meta({ id: 'QuoteResponse' });

type QuoteResponse = z.infer<typeof QuoteResponseSchema>;

export { type QuoteResponse, QuoteResponseSchema };
