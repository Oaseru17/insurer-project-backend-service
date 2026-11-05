import { z } from 'zod';
import { FieldValueSchema } from './field-value.schema';

const AnswersSchema = z
  .record(z.string(), FieldValueSchema)
  .meta({ id: 'Answers', description: "Keyed by the carrier's field keys." });

type Answers = z.infer<typeof AnswersSchema>;

export { type Answers, AnswersSchema };
