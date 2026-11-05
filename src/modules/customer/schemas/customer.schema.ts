import { z } from 'zod';
import { IsoDateSchema } from '../../../shared/schemas';

const CustomerSchema = z
  .object({
    first_name: z.string(),
    last_name: z.string(),
    date_of_birth: IsoDateSchema,
    email: z.string(),
    state: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .describe('Two-letter state code, e.g. CA. Carriers convert it to their own format.'),
    zip: z.string().regex(/^\d{5}$/),
    personal_property_value: z.number().nonnegative().describe('USD'),
    has_dog: z.boolean(),
    dog_breed: z.string().nullable(),
    claims_last_3_years: z.number().int().nonnegative(),
  })
  .meta({ id: 'Customer', description: "The platform's standard customer profile." });

type Customer = z.infer<typeof CustomerSchema>;

export { type Customer, CustomerSchema };
