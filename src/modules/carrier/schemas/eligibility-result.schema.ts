import { z } from 'zod';
import { ReasonSchema } from '../../../shared/schemas';

const EligibilityStatus = {
  Eligible: 'eligible',
  Ineligible: 'ineligible',
  Unknown: 'unknown',
} as const;
type EligibilityStatus = (typeof EligibilityStatus)[keyof typeof EligibilityStatus];

const EligibilityResultSchema = z
  .discriminatedUnion('status', [
    z.object({ status: z.literal(EligibilityStatus.Eligible) }),
    z.object({
      status: z.literal(EligibilityStatus.Ineligible),
      reasons: z.array(ReasonSchema).min(1),
    }),
    z.object({
      status: z.literal(EligibilityStatus.Unknown),
      pendingFields: z.array(z.string()).min(1),
    }),
  ])
  .meta({ id: 'EligibilityResult' });

type EligibilityResult = z.infer<typeof EligibilityResultSchema>;

export { type EligibilityResult, EligibilityResultSchema, EligibilityStatus };
