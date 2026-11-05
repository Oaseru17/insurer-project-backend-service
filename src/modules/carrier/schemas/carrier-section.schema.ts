import { z } from 'zod';

const CarrierSectionSchema = z
  .object({ id: z.string(), title: z.string(), fields: z.array(z.string()) })
  .meta({ id: 'CarrierSection', description: 'One page of the carrier form, in order' });

type CarrierSection = z.infer<typeof CarrierSectionSchema>;

export { type CarrierSection, CarrierSectionSchema };
