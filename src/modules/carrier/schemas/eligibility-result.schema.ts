import { z } from 'zod';
import { ReasonSchema } from '../../../shared/schemas';

const EligibilityResultSchema = z
  .discriminatedUnion('status', [
    z.object({ status: z.literal('eligible') }),
    z.object({ status: z.literal('ineligible'), reasons: z.array(ReasonSchema).min(1) }),
    z.object({ status: z.literal('unknown'), pendingFields: z.array(z.string()).min(1) }),
  ])
  .meta({ id: 'EligibilityResult' });

type EligibilityResult = z.infer<typeof EligibilityResultSchema>;

export { type EligibilityResult, EligibilityResultSchema };
