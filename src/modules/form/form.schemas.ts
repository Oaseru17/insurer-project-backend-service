import { z } from 'zod';
import { IsoDateSchema } from '../../shared/schemas';
import { FieldResolutionSchema } from '../carrier';

const PrefillRequestSchema = z
  .object({ customerId: z.string().min(1), asOf: IsoDateSchema })
  .meta({ id: 'PrefillRequest' });

const PrefillResponseSchema = z
  .object({
    carrierId: z.string(),
    customerId: z.string(),
    resolutions: z.array(FieldResolutionSchema),
    notes: z.array(z.string()).describe('Data-quality notes about the profile'),
  })
  .meta({ id: 'PrefillResponse' });

type PrefillRequest = z.infer<typeof PrefillRequestSchema>;
type PrefillResponse = z.infer<typeof PrefillResponseSchema>;

export { type PrefillRequest, type PrefillResponse, PrefillRequestSchema, PrefillResponseSchema };
