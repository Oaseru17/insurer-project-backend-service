import { z } from 'zod';
import { FieldValueSchema } from '../../../shared/schemas';

const ResolutionSource = {
  Profile: 'profile',
  Converted: 'converted',
  Suggested: 'suggested',
  Ask: 'ask',
} as const;
type ResolutionSource = (typeof ResolutionSource)[keyof typeof ResolutionSource];

const FieldResolutionSchema = z
  .object({
    key: z.string(),
    source: z
      .enum(ResolutionSource)
      .describe(
        'profile: copied as-is · converted: derived from the profile · suggested: a default the customer confirms · ask: the profile cannot answer it',
      ),
    value: FieldValueSchema.optional(),
    reason: z.string().describe('Why this field was resolved this way'),
    hint: z.string().optional().describe('Shown to the customer under the field'),
  })
  .meta({ id: 'FieldResolution' });

type FieldResolution = z.infer<typeof FieldResolutionSchema>;

export { type FieldResolution, FieldResolutionSchema, ResolutionSource };
