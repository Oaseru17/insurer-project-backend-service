import { z } from 'zod';
import { SUPPORTED_DATE_FORMATS } from './dates';

// A carrier's quote form arrives as JSON we don't control. Anything that changes how a field
// is validated or shown (type, validation key, showIf operator, date format, pattern) must be
// understood exactly, so unknowns are refused. Unknown keys that can't change behaviour
// (e.g. a placeholder) are dropped with a warning.

function isValidPattern(pattern: string): boolean {
  try {
    // Same semantics as the HTML `pattern` attribute: whole-value match, `v` flag.
    new RegExp(`^(?:${pattern})$`, 'v');
    return true;
  } catch {
    return false;
  }
}

const ShowIfSchema = z
  .strictObject({
    field: z.string().min(1),
    includes: z.union([z.string(), z.number()]),
  })
  .meta({ id: 'ShowIf', description: 'Show this field only when `field` includes `includes`.' });

const baseField = {
  key: z.string().regex(/^[a-z][a-z0-9_]*$/, 'field keys are snake_case'),
  label: z.string().min(1),
  required: z.boolean(),
  showIf: ShowIfSchema.optional(),
};

const TextFieldSchema = z.object({
  ...baseField,
  type: z.literal('text'),
  pattern: z.string().refine(isValidPattern, 'not a valid regular expression').optional(),
});

const DateFieldSchema = z.object({
  ...baseField,
  type: z.literal('date'),
  format: z.enum(SUPPORTED_DATE_FORMATS),
  validation: z.strictObject({ minAge: z.number().int().nonnegative().optional() }).optional(),
});

const EmailFieldSchema = z.object({ ...baseField, type: z.literal('email') });

const TelFieldSchema = z.object({ ...baseField, type: z.literal('tel') });

const SelectFieldSchema = z.object({
  ...baseField,
  type: z.literal('select'),
  options: z.array(z.union([z.string(), z.number()])).min(1),
});

const MultiSelectFieldSchema = z.object({
  ...baseField,
  type: z.literal('multiselect'),
  options: z.array(z.string()).min(1),
});

const NumberFieldSchema = z.object({
  ...baseField,
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
});

const BooleanFieldSchema = z.object({ ...baseField, type: z.literal('boolean') });

const FieldDefSchema = z
  .discriminatedUnion('type', [
    TextFieldSchema,
    DateFieldSchema,
    EmailFieldSchema,
    TelFieldSchema,
    SelectFieldSchema,
    MultiSelectFieldSchema,
    NumberFieldSchema,
    BooleanFieldSchema,
  ])
  .meta({ id: 'FieldDef' });

const FormDefinitionSchema = z
  .object({
    carrier: z.string().min(1),
    product: z.string().min(1),
    fields: z.array(FieldDefSchema).min(1),
  })
  .superRefine((form, ctx) => {
    const seen = new Map<string, FieldDef>();
    form.fields.forEach((field, index) => {
      if (seen.has(field.key)) {
        ctx.addIssue({ code: 'custom', path: ['fields', index, 'key'], message: 'duplicate key' });
      }
      if (field.showIf) {
        const parent = seen.get(field.showIf.field);
        if (!parent) {
          ctx.addIssue({
            code: 'custom',
            path: ['fields', index, 'showIf', 'field'],
            message: `showIf must reference an earlier field; "${field.showIf.field}" is not one`,
          });
        } else if (
          'options' in parent &&
          !(parent.options as (string | number)[]).includes(field.showIf.includes)
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['fields', index, 'showIf', 'includes'],
            message: `"${String(field.showIf.includes)}" is not an option of "${parent.key}"`,
          });
        }
      }
      seen.set(field.key, field);
    });
  })
  .meta({ id: 'FormDefinition' });

type FieldDef = z.infer<typeof FieldDefSchema>;
type FieldType = FieldDef['type'];
type FormDefinition = z.infer<typeof FormDefinitionSchema>;

const KNOWN_FIELD_KEYS = new Map<string, ReadonlySet<string>>(
  FieldDefSchema.options.map((schema) => [
    schema.shape.type.value,
    new Set(Object.keys(schema.shape)),
  ]),
);

class FormDefinitionError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Carrier form definition is not supported:\n- ${issues.join('\n- ')}`);
    this.name = 'FormDefinitionError';
    this.issues = issues;
  }
}

interface ParsedForm {
  form: FormDefinition;
  warnings: string[];
}

function unknownKeyWarnings(raw: unknown): string[] {
  if (typeof raw !== 'object' || raw === null || !('fields' in raw)) return [];
  const fields = (raw as { fields: unknown }).fields;
  if (!Array.isArray(fields)) return [];
  return fields.flatMap((field: unknown) => {
    if (typeof field !== 'object' || field === null) return [];
    const { key, type } = field as { key?: unknown; type?: unknown };
    const known = typeof type === 'string' ? KNOWN_FIELD_KEYS.get(type) : undefined;
    if (!known) return [];
    return Object.keys(field)
      .filter((k) => !known.has(k))
      .map((k) => `field "${String(key)}": unknown key "${k}" ignored`);
  });
}

function parseForm(raw: unknown): ParsedForm {
  const result = FormDefinitionSchema.safeParse(raw);
  if (!result.success) {
    throw new FormDefinitionError(
      result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`),
    );
  }
  return { form: result.data, warnings: unknownKeyWarnings(raw) };
}

export {
  type FieldDef,
  type FieldType,
  type FormDefinition,
  type ParsedForm,
  FieldDefSchema,
  FormDefinitionSchema,
  FormDefinitionError,
  parseForm,
};
