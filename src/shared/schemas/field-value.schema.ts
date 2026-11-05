import { z } from 'zod';

const FieldValueSchema = z
  .union([z.string(), z.number(), z.boolean(), z.array(z.string())])
  .meta({ id: 'FieldValue' });

type FieldValue = z.infer<typeof FieldValueSchema>;

export { type FieldValue, FieldValueSchema };
