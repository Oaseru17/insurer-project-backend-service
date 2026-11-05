import { z } from 'zod';
import { CustomerSchema } from './customer.schema';

const CustomerResponseSchema = CustomerSchema.extend({
  id: z.string(),
  date_of_birth: z
    .date()
    .describe('UTC midnight; sent as an ISO timestamp, e.g. 1994-03-12T00:00:00.000Z'),
}).meta({
  id: 'CustomerResponse',
});

type CustomerResponse = z.infer<typeof CustomerResponseSchema>;

export { type CustomerResponse, CustomerResponseSchema };
