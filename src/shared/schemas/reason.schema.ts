import { z } from 'zod';

const ReasonSchema = z
  .object({
    code: z.string(),
    field: z.string().optional(),
    message: z.string(),
  })
  .meta({ id: 'Reason' });

type Reason = z.infer<typeof ReasonSchema>;

export { type Reason, ReasonSchema };
