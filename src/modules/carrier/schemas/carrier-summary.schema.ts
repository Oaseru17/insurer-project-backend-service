import { z } from 'zod';

const CarrierSummarySchema = z
  .object({ id: z.string(), name: z.string(), product: z.string() })
  .meta({ id: 'CarrierSummary' });

type CarrierSummary = z.infer<typeof CarrierSummarySchema>;

export { type CarrierSummary, CarrierSummarySchema };
