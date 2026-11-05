import { z } from 'zod';

const PrefillQuerySchema = z.object({ customerId: z.string().min(1) }).meta({ id: 'PrefillQuery' });

type PrefillQuery = z.infer<typeof PrefillQuerySchema>;

export { type PrefillQuery, PrefillQuerySchema };
