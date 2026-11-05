import type { FieldDef, FormDefinition } from '../form-schema';
import type { Answers, FieldValue } from '../schemas';

function isAnswered(value: FieldValue | undefined): value is FieldValue {
  if (value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function includesValue(value: FieldValue | undefined, expected: string | number): boolean {
  return Array.isArray(value) ? value.some((item) => item === expected) : value === expected;
}

// A field is visible when it has no showIf, or its parent is visible and holds the value.
// The form schema guarantees a parent comes before its child, so one pass is enough.
function visibleFields(form: FormDefinition, answers: Answers): FieldDef[] {
  const visible = new Set<string>();
  return form.fields.filter((field) => {
    const shown =
      !field.showIf ||
      (visible.has(field.showIf.field) &&
        includesValue(answers[field.showIf.field], field.showIf.includes));
    if (shown) visible.add(field.key);
    return shown;
  });
}

function visibleAnswers(form: FormDefinition, answers: Answers): Answers {
  return Object.fromEntries(
    visibleFields(form, answers).flatMap((field) => {
      const value = answers[field.key];
      return isAnswered(value) ? [[field.key, value]] : [];
    }),
  );
}

export { isAnswered, visibleFields, visibleAnswers };
