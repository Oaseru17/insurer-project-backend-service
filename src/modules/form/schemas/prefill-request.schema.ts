import { z } from 'zod';
import { IsoDateSchema } from '../../../shared/schemas';

const PrefillRequestSchema = z
  .object({ customerId: z.string().min(1), asOf: IsoDateSchema })
  .meta({ id: 'PrefillRequest' });

type PrefillRequest = z.infer<typeof PrefillRequestSchema>;

export { type PrefillRequest, PrefillRequestSchema };
