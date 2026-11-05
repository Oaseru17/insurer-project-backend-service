import { z } from 'zod';
import { FieldValueSchema } from '../../../shared/schemas';

const FieldResolutionSchema = z
  .object({
    key: z.string(),
    source: z
      .enum(['profile', 'converted', 'suggested', 'ask'])
      .describe(
        'profile: copied as-is · converted: derived from the profile · suggested: a default the customer confirms · ask: the profile cannot answer it',
      ),
    value: FieldValueSchema.optional(),
    reason: z.string().describe('Why this field was resolved this way'),
    hint: z.string().optional().describe('Shown to the customer under the field'),
  })
  .meta({ id: 'FieldResolution' });

type FieldResolution = z.infer<typeof FieldResolutionSchema>;

export { type FieldResolution, FieldResolutionSchema };
