import { z } from 'zod';
import { FieldResolutionSchema } from '../../carrier';

const PrefillResponseSchema = z
  .object({
    carrierId: z.string(),
    customerId: z.string(),
    resolutions: z.array(FieldResolutionSchema),
    notes: z.array(z.string()).describe('Data-quality notes about the profile'),
  })
  .meta({ id: 'PrefillResponse' });

type PrefillResponse = z.infer<typeof PrefillResponseSchema>;

export { type PrefillResponse, PrefillResponseSchema };
