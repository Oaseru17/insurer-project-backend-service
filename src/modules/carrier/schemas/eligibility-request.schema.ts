import { z } from 'zod';
import { AnswersSchema, IsoDateSchema } from '../../../shared/schemas';

const EligibilityRequestSchema = z
  .object({
    customerId: z.string().min(1),
    answers: AnswersSchema.optional(),
    asOf: IsoDateSchema,
  })
  .meta({ id: 'EligibilityRequest' });

type EligibilityRequest = z.infer<typeof EligibilityRequestSchema>;

export { type EligibilityRequest, EligibilityRequestSchema };
