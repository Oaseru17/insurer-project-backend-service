import { z } from 'zod';
import { CarrierSectionSchema, FieldResolutionSchema } from '../../carrier';

const PrefillResponseSchema = z
  .object({
    carrierId: z.string(),
    customerId: z.string(),
    resolutions: z.array(FieldResolutionSchema),
    sections: z.array(CarrierSectionSchema),
  })
  .meta({ id: 'PrefillResponse' });

type PrefillResponse = z.infer<typeof PrefillResponseSchema>;

export { type PrefillResponse, PrefillResponseSchema };
