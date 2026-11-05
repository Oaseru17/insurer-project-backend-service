import { z } from 'zod';
import { AnswersSchema, IsoDateSchema } from '../../../shared/schemas';

const QuoteCreateRequestSchema = z
  .object({ customerId: z.string().min(1), answers: AnswersSchema, asOf: IsoDateSchema })
  .meta({ id: 'QuoteCreateRequest' });

type QuoteCreateRequest = z.infer<typeof QuoteCreateRequestSchema>;

export { type QuoteCreateRequest, QuoteCreateRequestSchema };
